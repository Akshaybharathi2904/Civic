"""
agents/orchestrator.py
───────────────────────
Master Orchestrator Agent — the AI "CEO" of the system.

This is the core intelligence that:
  1. Receives the initial task
  2. Asks Gemini "which agent should act next?" (NO hardcoded sequence)
  3. Dispatches work to that agent
  4. Evaluates the result
  5. Decides whether to continue, retry, or terminate
  6. Manages the full workflow loop until completion

Every routing decision is produced by a genuine LLM reasoning step.
"""

from __future__ import annotations

import asyncio
from typing import Any

from agents.base_agent import BaseAgent
from agents.decision import DecisionAgent
from agents.executor import ExecutorAgent
from agents.memory import MemoryAgent
from agents.planner import PlannerAgent
from agents.reporter import ReporterAgent
from agents.researcher import ResearchAgent
from agents.validator import ValidatorAgent
from config.settings import settings
from models.schemas import (
    AgentMessage,
    AgentName,
    MessageType,
    Priority,
    TaskStatus,
    WorkflowSession,
)
from prompts.system_prompts import ORCHESTRATOR_SYSTEM
from prompts.agent_prompts import (
    orchestrator_routing_prompt,
    orchestrator_reflection_prompt,
)
from utils.helpers import safe_json_dumps, utcnow
from utils.logger import get_logger
from workflows.task_graph import TaskGraph


class OrchestratorAgent(BaseAgent):
    """
    The Master Orchestrator.

    Routing logic is 100% LLM-driven.
    The orchestrator never knows in advance which agent will run —
    it asks the LLM at every step.
    """

    @property
    def name(self) -> AgentName:
        return AgentName.ORCHESTRATOR

    def __init__(self, **kwargs: Any) -> None:
        super().__init__(system_prompt=ORCHESTRATOR_SYSTEM, **kwargs)

        # Instantiate all specialist agents
        agent_kwargs = {
            "bus": self._bus,
            "registry": self._registry,
            "shared_memory": self._shared_memory,
            "vector_store": self._vector_store,
        }
        self._agents: dict[AgentName, BaseAgent] = {
            AgentName.PLANNER:    PlannerAgent(**agent_kwargs),
            AgentName.RESEARCHER: ResearchAgent(**agent_kwargs),
            AgentName.DECISION:   DecisionAgent(**agent_kwargs),
            AgentName.EXECUTOR:   ExecutorAgent(**agent_kwargs),
            AgentName.VALIDATOR:  ValidatorAgent(**agent_kwargs),
            AgentName.REPORTER:   ReporterAgent(**agent_kwargs),
            AgentName.MEMORY:     MemoryAgent(**agent_kwargs),
        }

        self._log = get_logger(__name__, agent_name="OrchestratorAgent")

    # ─── Main Entry Point ────────────────────────────────────────────────────

    async def run(self, task: str, *, context: dict[str, Any] | None = None) -> WorkflowSession:
        """
        Run the full autonomous multi-agent workflow for the given task.
        Returns the completed WorkflowSession.
        """
        session = WorkflowSession(
            initial_task=task,
            status=TaskStatus.IN_PROGRESS,
            metadata=context or {},
        )

        self.set_session(session)
        for agent in self._agents.values():
            agent.set_session(session)

        self._log.info(
            f"═══════════════════════════════════════════════\n"
            f"  ORCHESTRATOR STARTING\n"
            f"  Session: {session.session_id}\n"
            f"  Task: {task}\n"
            f"═══════════════════════════════════════════════"
        )

        # Store initial task in shared memory
        await self._shared_memory.set("workflow:task", task, written_by="Orchestrator")
        await self._shared_memory.set(
            "workflow:session_id", session.session_id, written_by="Orchestrator"
        )

        # Store initial task in memory
        await self.store_memory(
            f"Workflow started: '{task}'",
            importance=1.0,
            tags=["task", "start"],
        )

        # ─── Main orchestration loop ─────────────────────────────────────────
        max_rounds = settings.max_orchestration_rounds
        reflection_count = 0

        for round_num in range(1, max_rounds + 1):
            session.round = round_num
            self._log.info(f"\n─── Round {round_num}/{max_rounds} ───")

            # ── LLM routing decision ─────────────────────────────────────────
            routing = await self._decide_next_agent(session)

            if not routing:
                self._log.error("Routing decision failed — terminating")
                break

            # ── Termination check ────────────────────────────────────────────
            if routing.get("should_terminate"):
                reason = routing.get("termination_reason", "Workflow complete")
                self._log.info(f"✓ Orchestrator terminating: {reason}")
                break

            # ── Dispatch to chosen agent ─────────────────────────────────────
            next_agent_str = routing.get("next_agent", "")
            next_task = routing.get("task", task)
            priority_str = routing.get("priority", "medium")
            extra_context = routing.get("context", {})

            try:
                next_agent_name = AgentName(next_agent_str)
            except ValueError:
                self._log.warning(
                    f"LLM chose unknown agent '{next_agent_str}' — defaulting to Executor"
                )
                next_agent_name = AgentName.EXECUTOR

            agent = self._agents.get(next_agent_name)
            if not agent:
                self._log.error(f"Agent {next_agent_name} not found")
                continue

            # Build message
            message = AgentMessage(
                from_agent=self.name,
                to_agent=next_agent_name,
                type=MessageType.TASK,
                task=next_task,
                priority=Priority(priority_str) if priority_str in Priority._value2member_map_ else Priority.MEDIUM,
                context={
                    **session.get_context_summary(),
                    **extra_context,
                    "orchestrator_reasoning": routing.get("reasoning", ""),
                },
                session_id=session.session_id,
                round=round_num,
            )

            session.add_message(message)
            await self._bus.publish(message)

            self._log.info(
                f"Dispatching → {next_agent_name.value}: '{next_task[:80]}'"
            )

            # ── Execute agent ────────────────────────────────────────────────
            try:
                agent_output = await asyncio.wait_for(
                    agent.execute(message, session),
                    timeout=float(settings.agent_timeout_seconds),
                )
            except asyncio.TimeoutError:
                self._log.error(
                    f"Agent {next_agent_name.value} timed out after "
                    f"{settings.agent_timeout_seconds}s"
                )
                agent_output = {
                    "error": "timeout",
                    "agent": next_agent_name.value,
                }
            except Exception as e:
                self._log.exception(
                    f"Agent {next_agent_name.value} raised exception", e
                )
                agent_output = {
                    "error": str(e),
                    "agent": next_agent_name.value,
                }

            session.set_agent_output(next_agent_name, agent_output)

            self._log.info(
                f"← {next_agent_name.value} completed "
                f"(success={agent_output.get('success', '?')})"
            )

            # ── Post-execution reflection ─────────────────────────────────────
            # After validation runs, reflect on whether to retry or continue
            if next_agent_name == AgentName.VALIDATOR:
                validation = agent_output.get("validation", {})
                should_retry = validation.get("should_retry", False)
                score = validation.get("score", 1.0)

                if should_retry and reflection_count < settings.max_reflection_loops:
                    reflection_count += 1
                    self._log.warning(
                        f"Validation score={score:.2f} → triggering reflection "
                        f"loop {reflection_count}/{settings.max_reflection_loops}"
                    )
                    # Update shared memory with retry instructions
                    await self._shared_memory.set(
                        "workflow:retry_instructions",
                        validation.get("retry_instructions", "Improve output quality"),
                        written_by="Orchestrator",
                    )

            # Store agent output summary in memory for orchestrator context
            summary = self._summarise_output(next_agent_name, agent_output)
            await self.store_memory(
                f"Round {round_num}: {next_agent_name.value} → {summary}",
                importance=0.7,
                tags=["round", next_agent_name.value.lower()],
            )

        # ─── Completion ──────────────────────────────────────────────────────
        session.status = TaskStatus.COMPLETED
        session.completed_at = utcnow()

        # Ensure reporter has run
        if not session.get_agent_output(AgentName.REPORTER):
            self._log.info("Forcing reporter to generate final report...")
            reporter = self._agents[AgentName.REPORTER]
            final_msg = AgentMessage(
                from_agent=self.name,
                to_agent=AgentName.REPORTER,
                type=MessageType.TASK,
                task=f"Generate final report for: {task}",
                session_id=session.session_id,
            )
            await reporter.execute(final_msg, session)

        report_output = session.get_agent_output(AgentName.REPORTER) or {}
        self._log.info(
            f"\n═══════════════════════════════════════════════\n"
            f"  WORKFLOW COMPLETE\n"
            f"  Session: {session.session_id}\n"
            f"  Rounds: {session.round}\n"
            f"  Report: {report_output.get('title', 'N/A')}\n"
            f"═══════════════════════════════════════════════"
        )

        return session

    # ─── LLM Routing Decision ────────────────────────────────────────────────

    async def _decide_next_agent(
        self, session: WorkflowSession
    ) -> dict[str, Any] | None:
        """
        Ask the LLM: given the current state, which agent should act next?
        This is the heart of the autonomous routing.
        """
        available_agents = [a.value for a in self._agents.keys()]
        shared_mem_str = await self._shared_memory.to_prompt_str(max_keys=15)

        prompt = orchestrator_routing_prompt(
            session=session,
            available_agents=available_agents,
            shared_memory_str=shared_mem_str,
        )

        routing = await self._llm.generate_json(
            prompt,
            schema_hint=(
                '{"reasoning": "str", "next_agent": "str", '
                '"task": "str", "priority": "str", "context": {}, '
                '"should_terminate": bool, "termination_reason": null}'
            ),
        )

        if routing:
            self._log.info(
                f"Routing decision: {routing.get('next_agent')} | "
                f"terminate={routing.get('should_terminate')} | "
                f"reasoning: {routing.get('reasoning', '')[:100]}"
            )

        return routing

    # ─── execute() (BaseAgent interface) ─────────────────────────────────────

    async def execute(
        self,
        message: AgentMessage,
        session: WorkflowSession,
    ) -> dict[str, Any]:
        """The orchestrator's execute is its run() method."""
        result = await self.run(message.task, context=message.context)
        return {"session_id": result.session_id, "status": result.status.value}

    # ─── Helpers ─────────────────────────────────────────────────────────────

    def _summarise_output(
        self, agent: AgentName, output: dict[str, Any]
    ) -> str:
        """Compact summary for memory storage."""
        if "error" in output:
            return f"ERROR: {output['error'][:100]}"
        if agent == AgentName.PLANNER:
            return f"Plan created with {output.get('step_count', '?')} steps"
        if agent == AgentName.RESEARCHER:
            return f"Research: {output.get('summary', '')[:100]}"
        if agent == AgentName.DECISION:
            return f"Decision: {output.get('selected_option', '')[:100]}"
        if agent == AgentName.EXECUTOR:
            return (
                f"Executed {output.get('tool_calls_executed', len(output.get('tool_results', [])))} tools "
                f"success={output.get('success', '?')}"
            )
        if agent == AgentName.VALIDATOR:
            v = output.get("validation", {})
            return f"Validated score={v.get('score', '?')} valid={v.get('valid', '?')}"
        if agent == AgentName.REPORTER:
            return f"Report: {output.get('title', '')[:80]}"
        return str(output)[:100]
