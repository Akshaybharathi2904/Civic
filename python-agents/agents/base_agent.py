"""
agents/base_agent.py
────────────────────
Abstract base class that every agent inherits from.

Provides the full agent interface:
  plan()          — create a sub-plan for the agent's task
  think()         — inner monologue / scratchpad reasoning
  reason()        — structured reasoning about what to do
  select_tool()   — LLM-driven tool selection
  execute()       — core task implementation (abstract)
  delegate()      — send work to another agent via the message bus
  review()        — self-review of own output
  communicate()   — send a typed message via the bus
  store_memory()  — persist a memory entry
  retrieve_memory()— retrieve relevant memories
"""

from __future__ import annotations

import asyncio
from abc import ABC, abstractmethod
from typing import Any

from memory.agent_memory import AgentMemory
from memory.shared_memory import SharedMemory
from memory.vector_store import VectorStore
from models.llm_client import LLMClient, make_llm
from models.schemas import (
    AgentMessage,
    AgentName,
    AgentReport,
    MemoryEntry,
    MessageType,
    Priority,
    ReasoningStep,
    ToolCall,
    ToolResult,
    WorkflowSession,
)
from tools.tool_registry import ToolRegistry
from utils.helpers import extract_json, new_id, safe_json_dumps, utcnow
from utils.logger import get_logger
from workflows.message_bus import MessageBus


class BaseAgent(ABC):
    """
    Abstract base for every agent in the system.

    Each subclass must implement:
      - `name`    (property) → AgentName
      - `execute` (method)  → perform the agent's primary task

    All other methods have default implementations that subclasses
    may override for specialised behaviour.
    """

    def __init__(
        self,
        *,
        bus: MessageBus,
        registry: ToolRegistry,
        shared_memory: SharedMemory,
        vector_store: VectorStore,
        system_prompt: str,
    ) -> None:
        self._bus = bus
        self._registry = registry
        self._shared_memory = shared_memory
        self._vector_store = vector_store

        # Per-agent memory
        self._memory = AgentMemory(self.name)

        # Dedicated LLM client for this agent
        self._llm: LLMClient = make_llm(self.name.value, system_prompt)

        # Logger bound to this agent
        self._log = get_logger(__name__, agent_name=self.name.value)

        # Internal state
        self._session: WorkflowSession | None = None
        self._reasoning_steps: list[ReasoningStep] = []

    # ─── Abstract interface ──────────────────────────────────────────────────

    @property
    @abstractmethod
    def name(self) -> AgentName:
        """The unique identifier for this agent."""
        ...

    @abstractmethod
    async def execute(
        self,
        message: AgentMessage,
        session: WorkflowSession,
    ) -> dict[str, Any]:
        """
        Primary task implementation.
        Receives the incoming message and session; returns a result dict.
        """
        ...

    # ─── plan() ──────────────────────────────────────────────────────────────

    async def plan(self, task: str, context: dict[str, Any]) -> list[str]:
        """
        Create a short action plan for the current task.
        Returns a list of action strings.
        """
        prompt = (
            f"You need to complete this task: {task}\n\n"
            f"Context: {safe_json_dumps(context)[:500]}\n\n"
            f"List 3-5 concrete actions you will take to complete this task.\n"
            f"Respond with JSON: {{\"actions\": [\"action 1\", \"action 2\", ...]}}"
        )
        result = await self._llm.generate_json(prompt)
        if result and isinstance(result, dict):
            return result.get("actions", [])
        return [f"Execute: {task}"]

    # ─── think() ─────────────────────────────────────────────────────────────

    async def think(self, situation: str) -> str:
        """
        Inner monologue — the agent reasons about a situation
        without committing to an action.  Returns a thought string.
        """
        prompt = (
            f"Situation: {situation}\n\n"
            f"Think step by step about this situation. "
            f"What do you observe? What matters? What should be done?\n"
            f"Respond with JSON: {{\"thought\": \"your detailed reasoning\"}}"
        )
        result = await self._llm.generate_json(prompt)
        thought = ""
        if result and isinstance(result, dict):
            thought = result.get("thought", "")

        # Record reasoning step
        step = ReasoningStep(
            agent_name=self.name,
            thought=thought,
            action=None,
        )
        self._reasoning_steps.append(step)
        if self._session:
            self._session.add_reasoning(step)

        self._log.debug(f"think() → {thought[:100]}")
        return thought

    # ─── reason() ────────────────────────────────────────────────────────────

    async def reason(
        self,
        task: str,
        context: dict[str, Any],
        options: list[str] | None = None,
    ) -> dict[str, Any]:
        """
        Structured reasoning: given a task and context, return a
        reasoned decision with confidence score.
        """
        options_str = (
            "\n".join(f"  - {o}" for o in options)
            if options
            else "  (determine options yourself)"
        )
        prompt = (
            f"Task: {task}\n\n"
            f"Context:\n{safe_json_dumps(context)[:600]}\n\n"
            f"Options to consider:\n{options_str}\n\n"
            f"Reason step-by-step and select the best approach.\n"
            f"Respond with JSON:\n"
            f'{{"reasoning": "...", "chosen_action": "...", "confidence": 0.0, "rationale": "..."}}'
        )
        result = await self._llm.generate_json(prompt)
        if result:
            step = ReasoningStep(
                agent_name=self.name,
                thought=result.get("reasoning", ""),
                action=result.get("chosen_action"),
            )
            self._reasoning_steps.append(step)
            if self._session:
                self._session.add_reasoning(step)
        return result or {}

    # ─── select_tool() ───────────────────────────────────────────────────────

    async def select_tool(
        self,
        task: str,
        context: dict[str, Any],
    ) -> tuple[str, dict[str, Any]] | tuple[None, None]:
        """
        Ask the LLM to select the best tool for the current task.
        Returns (tool_name, arguments) or (None, None) if no tool needed.
        """
        tool_descriptions = self._registry.prompt_descriptions()
        prompt = (
            f"Task: {task}\n\n"
            f"Context: {safe_json_dumps(context)[:400]}\n\n"
            f"Available tools:\n{tool_descriptions}\n\n"
            f"Select the best tool to use (or none if not needed).\n"
            f"Respond with JSON:\n"
            f'{{"tool": "tool_name_or_null", "arguments": {{}}, "reasoning": "..."}}'
        )
        result = await self._llm.generate_json(prompt)
        if result and isinstance(result, dict):
            tool_name = result.get("tool")
            if tool_name and tool_name != "null" and tool_name in self._registry:
                self._log.info(
                    f"select_tool() → {tool_name} | reason: {result.get('reasoning', '')[:80]}"
                )
                return tool_name, result.get("arguments", {})
        return None, None

    # ─── run_tool() ──────────────────────────────────────────────────────────

    async def run_tool(
        self,
        tool_name: str,
        arguments: dict[str, Any],
    ) -> ToolResult:
        """Execute a named tool and record the call in the session."""
        tool = self._registry.get(tool_name)
        if not tool:
            return ToolResult(
                call_id=new_id(),
                tool_name=tool_name,
                success=False,
                output=None,
                error=f"Tool '{tool_name}' not found in registry",
            )

        call = ToolCall(tool_name=tool_name, arguments=arguments)
        if self._session:
            self._session.tool_calls.append(call)

        result = await tool.execute(arguments, call_id=call.call_id)

        if self._session:
            self._session.tool_results.append(result)

        return result

    # ─── run_tool_calls() ────────────────────────────────────────────────────

    async def run_tool_calls(
        self,
        tool_calls: list[dict[str, Any]],
    ) -> list[ToolResult]:
        """
        Execute a list of tool call dicts from LLM output.
        Format: [{"tool": "name", "arguments": {...}}, ...]
        """
        results: list[ToolResult] = []
        for tc in tool_calls:
            name = tc.get("tool") or tc.get("tool_name")
            args = tc.get("arguments") or tc.get("args") or {}
            if name and name in self._registry:
                result = await self.run_tool(name, args)
                results.append(result)
            else:
                self._log.warning(f"Skipping unknown tool: {name}")
        return results

    # ─── delegate() ──────────────────────────────────────────────────────────

    async def delegate(
        self,
        to_agent: AgentName,
        task: str,
        *,
        priority: Priority = Priority.MEDIUM,
        context: dict[str, Any] | None = None,
        payload: dict[str, Any] | None = None,
    ) -> None:
        """
        Send a task to another agent via the message bus.
        """
        msg = AgentMessage(
            from_agent=self.name,
            to_agent=to_agent,
            type=MessageType.DELEGATION,
            task=task,
            priority=priority,
            context=context or {},
            payload=payload or {},
            session_id=self._session.session_id if self._session else None,
        )
        await self._bus.publish(msg)
        self._log.info(f"delegate() → {to_agent.value}: '{task[:80]}'")

    # ─── review() ────────────────────────────────────────────────────────────

    async def review(self, output: dict[str, Any], task: str) -> dict[str, Any]:
        """
        Self-review of the agent's own output before returning it.
        Returns the output potentially with a `self_review` field added.
        """
        prompt = (
            f"You just produced this output for the task: '{task}'\n\n"
            f"Output: {safe_json_dumps(output)[:1000]}\n\n"
            f"Critically review your own work:\n"
            f"- Is it complete?\n"
            f"- Is it accurate?\n"
            f"- What could be improved?\n\n"
            f"Respond with JSON:\n"
            f'{{"assessment": "...", "quality_score": 0.0, "improvements": [], "is_sufficient": true}}'
        )
        review_result = await self._llm.generate_json(prompt)
        if review_result:
            output["self_review"] = review_result
            self._log.info(
                f"self_review score={review_result.get('quality_score', '?')} "
                f"sufficient={review_result.get('is_sufficient', '?')}"
            )
        return output

    # ─── communicate() ───────────────────────────────────────────────────────

    async def communicate(self, message: AgentMessage) -> None:
        """Publish a typed message to the message bus."""
        await self._bus.publish(message)

    # ─── store_memory() ──────────────────────────────────────────────────────

    async def store_memory(
        self,
        content: str,
        *,
        importance: float = 0.5,
        tags: list[str] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> MemoryEntry:
        """Persist a memory and index it in the vector store."""
        entry = self._memory.store(
            content,
            importance=importance,
            tags=tags,
            metadata=metadata,
            session_id=self._session.session_id if self._session else None,
        )
        self._vector_store.add(entry)
        return entry

    # ─── retrieve_memory() ──────────────────────────────────────────────────

    async def retrieve_memory(
        self,
        query: str,
        *,
        top_k: int = 5,
    ) -> list[MemoryEntry]:
        """Retrieve semantically relevant memories using the vector store."""
        results = self._vector_store.search(
            query,
            top_k=top_k,
            min_score=0.05,
        )
        return [entry for _, entry in results]

    # ─── Session helpers ─────────────────────────────────────────────────────

    def set_session(self, session: WorkflowSession) -> None:
        self._session = session
        self._llm.reset_history()

    def get_reasoning_steps(self) -> list[ReasoningStep]:
        return list(self._reasoning_steps)

    async def _working_memory_text(self) -> str:
        return self._memory.working_memory_as_text()

    async def _shared_memory_text(self) -> str:
        return await self._shared_memory.to_prompt_str()

    # ─── Logging helper ─────────────────────────────────────────────────────

    def _log_start(self, task: str) -> None:
        self._log.info(f"▶ Starting: '{task[:80]}'")

    def _log_done(self, task: str) -> None:
        self._log.info(f"✓ Done: '{task[:80]}'")

    def _log_error(self, task: str, error: Exception) -> None:
        self._log.exception(f"✗ Error in '{task[:60]}'", error)
