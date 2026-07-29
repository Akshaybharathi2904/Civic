"""
agents/decision.py
──────────────────
Decision Agent — evaluates options and makes evidence-based decisions.

Responsibilities:
  - Analyse research findings
  - Define and compare options with explicit trade-offs
  - Make a clear, reasoned decision with confidence scoring
  - Flag decisions needing human review
"""

from __future__ import annotations

from typing import Any

from agents.base_agent import BaseAgent
from models.schemas import AgentMessage, AgentName, WorkflowSession
from prompts.system_prompts import DECISION_SYSTEM
from prompts.agent_prompts import decision_prompt
from utils.helpers import safe_json_dumps


class DecisionAgent(BaseAgent):

    @property
    def name(self) -> AgentName:
        return AgentName.DECISION

    def __init__(self, **kwargs: Any) -> None:
        super().__init__(system_prompt=DECISION_SYSTEM, **kwargs)

    async def execute(
        self,
        message: AgentMessage,
        session: WorkflowSession,
    ) -> dict[str, Any]:
        self.set_session(session)
        self._log_start(message.task)

        task = message.task
        context = message.context

        # Pull research findings from shared memory
        research = await self._shared_memory.get_research() or {}
        research_findings = research.get("findings", {})
        research_summary = research.get("summary", "")

        # Retrieve relevant memory
        memory_ctx = await self._memory.working_memory_as_text()
        relevant_memories = await self.retrieve_memory(task, top_k=3)
        memory_str = memory_ctx
        if relevant_memories:
            memory_str += "\n\nRelevant decisions:\n" + "\n".join(
                f"• {e.content[:150]}" for e in relevant_memories
            )

        # Enhance context with research
        enhanced_context = {
            **context,
            "research_summary": research_summary,
            "session_state": session.get_context_summary(),
        }

        # Think before deciding
        thought = await self.think(
            f"I need to make a decision about: '{task}'. "
            f"I have research findings: {research_summary[:300]}. "
            f"What options exist? What are the trade-offs?"
        )

        prompt = decision_prompt(
            task=task,
            research_findings=research_findings,
            context=enhanced_context,
            memory_context=memory_str,
        )

        raw_decision = await self._llm.generate_json(prompt) or {}

        output: dict[str, Any] = {
            "agent": self.name.value,
            "task": task,
            "thinking": raw_decision.get("thinking", thought),
            "options_considered": raw_decision.get("options_considered", []),
            "selected_option": raw_decision.get("selected_option", ""),
            "rationale": raw_decision.get("rationale", ""),
            "confidence": raw_decision.get("confidence", 0.5),
            "caveats": raw_decision.get("caveats", []),
            "requires_human_review": raw_decision.get("requires_human_review", False),
        }

        # Self-review
        output = await self.review(output, task)

        # Persist decision to shared memory
        await self._shared_memory.set_decision(output)

        # Store in memory
        if output.get("selected_option"):
            await self.store_memory(
                f"Decision for '{task[:60]}': {output['selected_option']} "
                f"(confidence={output['confidence']:.2f})",
                importance=0.85,
                tags=["decision", "selected"],
            )

        # Warn if human review needed
        if output.get("requires_human_review"):
            self._log.warning(
                f"Decision flagged for human review: {output.get('selected_option', '')}"
            )

        # Update session
        session.set_agent_output(self.name, output)

        self._log_done(task)
        return output
