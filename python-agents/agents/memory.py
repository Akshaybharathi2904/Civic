"""
agents/memory.py
─────────────────
Memory Agent — manages retrieval and storage of agent memories.

Responsibilities:
  - Retrieve relevant context from all memory stores
  - Decide what information is important to persist
  - Synthesise memories into coherent context summaries
  - Maintain the shared memory board
"""

from __future__ import annotations

from typing import Any

from agents.base_agent import BaseAgent
from models.schemas import AgentMessage, AgentName, WorkflowSession
from prompts.system_prompts import MEMORY_SYSTEM
from prompts.agent_prompts import memory_retrieve_prompt, memory_store_prompt
from utils.helpers import safe_json_dumps


class MemoryAgent(BaseAgent):

    @property
    def name(self) -> AgentName:
        return AgentName.MEMORY

    def __init__(self, **kwargs: Any) -> None:
        super().__init__(system_prompt=MEMORY_SYSTEM, **kwargs)

    async def execute(
        self,
        message: AgentMessage,
        session: WorkflowSession,
    ) -> dict[str, Any]:
        self.set_session(session)
        self._log_start(message.task)

        task = message.task
        context = message.context
        payload = message.payload

        # Determine sub-task: retrieve or store
        sub_task = payload.get("sub_task", "retrieve")

        if sub_task == "store":
            return await self._store(payload, session)
        else:
            return await self._retrieve(task, context, session)

    # ─── Retrieve ────────────────────────────────────────────────────────────

    async def _retrieve(
        self,
        query: str,
        context: dict[str, Any],
        session: WorkflowSession,
    ) -> dict[str, Any]:
        self._log.info(f"Retrieving memories for: '{query[:80]}'")

        # Get relevant entries from vector store
        relevant_entries = await self.retrieve_memory(query, top_k=8)
        memory_lines = []
        for entry in relevant_entries:
            memory_lines.append(
                f"[{entry.agent_name.value}|imp={entry.importance:.2f}] {entry.content[:200]}"
            )
        agent_memories_str = "\n".join(memory_lines) if memory_lines else "(empty)"

        shared_memory_str = await self._shared_memory_text()

        prompt = memory_retrieve_prompt(query, agent_memories_str, shared_memory_str)
        result = await self._llm.generate_json(prompt) or {}

        # Store the retrieved context summary back to shared memory
        if result.get("synthesised_context"):
            await self._shared_memory.set(
                f"memory:context:{query[:40]}",
                result["synthesised_context"],
                written_by=self.name.value,
            )

        self._log_done(query)
        return {
            "agent": self.name.value,
            "query": query,
            "relevant_memories": result.get("relevant_memories", []),
            "synthesised_context": result.get("synthesised_context", ""),
            "missing_context": result.get("missing_context", []),
            "memory_count": len(relevant_entries),
        }

    # ─── Store ───────────────────────────────────────────────────────────────

    async def _store(
        self,
        payload: dict[str, Any],
        session: WorkflowSession,
    ) -> dict[str, Any]:
        content = payload.get("content", "")
        agent_name = payload.get("agent_name", "unknown")

        if not content:
            return {"agent": self.name.value, "stored": False, "reason": "empty content"}

        # Ask LLM to evaluate importance and summarise
        prompt = memory_store_prompt(
            agent_name,
            content,
            session.get_context_summary(),
        )
        result = await self._llm.generate_json(prompt) or {}

        should_store = result.get("should_store", True)
        importance = float(result.get("importance", 0.5))
        tags = result.get("tags", [])
        summary = result.get("summary", content[:200])

        if should_store:
            await self.store_memory(
                summary,
                importance=importance,
                tags=tags,
                metadata={"original_agent": agent_name},
            )
            self._log.info(
                f"Memory stored [imp={importance:.2f}] tags={tags}: '{summary[:80]}'"
            )

        return {
            "agent": self.name.value,
            "stored": should_store,
            "importance": importance,
            "tags": tags,
            "summary": summary,
        }

    # ─── Public helpers ──────────────────────────────────────────────────────

    async def get_context_for(self, query: str) -> str:
        """
        Convenience method: retrieve and return a text summary
        of relevant memories for the given query.
        """
        results = await self.retrieve_memory(query, top_k=5)
        if not results:
            return "(no relevant memory found)"
        lines = [f"• [{e.agent_name.value}] {e.content[:200]}" for e in results]
        return "\n".join(lines)
