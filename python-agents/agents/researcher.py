"""
agents/researcher.py
─────────────────────
Research Agent — gathers information using tools.

Responsibilities:
  - Formulate research questions from the task
  - Select and call appropriate search/data tools
  - Synthesise findings from multiple sources
  - Return structured research output for DecisionAgent
"""

from __future__ import annotations

from typing import Any

from agents.base_agent import BaseAgent
from models.schemas import AgentMessage, AgentName, WorkflowSession
from prompts.system_prompts import RESEARCHER_SYSTEM
from prompts.agent_prompts import researcher_prompt
from utils.helpers import safe_json_dumps


class ResearchAgent(BaseAgent):

    @property
    def name(self) -> AgentName:
        return AgentName.RESEARCHER

    def __init__(self, **kwargs: Any) -> None:
        super().__init__(system_prompt=RESEARCHER_SYSTEM, **kwargs)

    async def execute(
        self,
        message: AgentMessage,
        session: WorkflowSession,
    ) -> dict[str, Any]:
        self.set_session(session)
        self._log_start(message.task)

        task = message.task
        context = message.context

        # Retrieve relevant prior memory
        memory_ctx = await self._memory.working_memory_as_text()
        relevant_memories = await self.retrieve_memory(task, top_k=3)
        memory_str = memory_ctx
        if relevant_memories:
            memory_str += "\n\nRelevant past research:\n" + "\n".join(
                f"• {e.content[:200]}" for e in relevant_memories
            )

        # Build research plan via LLM
        tools_desc = self._registry.prompt_descriptions()
        prompt = researcher_prompt(
            task=task,
            context=context,
            available_tools=tools_desc,
            memory_context=memory_str,
        )

        research_plan = await self._llm.generate_json(prompt) or {}

        # Execute tool calls from the research plan
        tool_calls = research_plan.get("tool_calls", [])
        tool_results: list[dict[str, Any]] = []

        for tc in tool_calls:
            tool_name = tc.get("tool") or tc.get("tool_name")
            args = tc.get("arguments", {})
            if tool_name and tool_name in self._registry:
                self._log.info(f"Research tool call: {tool_name}({args})")
                result = await self.run_tool(tool_name, args)
                tool_results.append({
                    "tool": tool_name,
                    "arguments": args,
                    "success": result.success,
                    "output": result.output,
                    "error": result.error,
                })

        # If we have tool results, synthesise with a follow-up LLM call
        if tool_results:
            synthesis_prompt = (
                f"Original research task: {task}\n\n"
                f"Tool results:\n{safe_json_dumps(tool_results)[:3000]}\n\n"
                f"Now synthesise these findings into a comprehensive research report.\n"
                f"Respond with JSON:\n"
                f'{{"findings": {{"key_facts": [], "data_points": [], "sources": [], '
                f'"gaps": [], "confidence": "medium"}}, "summary": "..."}}'
            )
            synthesis = await self._llm.generate_json(synthesis_prompt) or {}
            findings = synthesis.get("findings", research_plan.get("findings", {}))
            summary = synthesis.get("summary", research_plan.get("summary", ""))
        else:
            findings = research_plan.get("findings", {})
            summary = research_plan.get("summary", "")

        # Build final output
        output: dict[str, Any] = {
            "agent": self.name.value,
            "task": task,
            "research_questions": research_plan.get("research_questions", []),
            "tool_calls_executed": len(tool_results),
            "tool_results": tool_results,
            "findings": findings,
            "summary": summary,
            "thinking": research_plan.get("thinking", ""),
        }

        # Self-review
        output = await self.review(output, task)

        # Persist research to shared memory
        await self._shared_memory.set_research(output)

        # Store important findings in agent memory
        if summary:
            await self.store_memory(
                f"Research on '{task[:60]}': {summary[:300]}",
                importance=0.8,
                tags=["research", "findings"],
            )

        # Update session output
        session.set_agent_output(self.name, output)

        self._log_done(task)
        return output
