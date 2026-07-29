"""
agents/executor.py
──────────────────
Execution Agent — carries out tasks using tools.

Responsibilities:
  - Receive a task and the relevant decision from DecisionAgent
  - Select and execute tools to accomplish the task
  - Handle tool errors with retry and alternative approaches
  - Return detailed execution output
"""

from __future__ import annotations

from typing import Any

from agents.base_agent import BaseAgent
from models.schemas import AgentMessage, AgentName, WorkflowSession
from prompts.system_prompts import EXECUTOR_SYSTEM
from prompts.agent_prompts import executor_prompt
from utils.helpers import safe_json_dumps


class ExecutorAgent(BaseAgent):

    @property
    def name(self) -> AgentName:
        return AgentName.EXECUTOR

    def __init__(self, **kwargs: Any) -> None:
        super().__init__(system_prompt=EXECUTOR_SYSTEM, **kwargs)

    async def execute(
        self,
        message: AgentMessage,
        session: WorkflowSession,
    ) -> dict[str, Any]:
        self.set_session(session)
        self._log_start(message.task)

        task = message.task
        context = message.context

        # Pull decision from shared memory
        decision = await self._shared_memory.get_decision() or {}

        # Retrieve memory
        memory_ctx = await self._memory.working_memory_as_text()
        relevant_memories = await self.retrieve_memory(task, top_k=3)
        memory_str = memory_ctx
        if relevant_memories:
            memory_str += "\n\nPast executions:\n" + "\n".join(
                f"• {e.content[:150]}" for e in relevant_memories
            )

        tools_desc = self._registry.prompt_descriptions()
        enhanced_context = {
            **context,
            "session_state": session.get_context_summary(),
        }

        prompt = executor_prompt(
            task=task,
            context=enhanced_context,
            decision=decision,
            available_tools=tools_desc,
            memory_context=memory_str,
        )

        execution_plan = await self._llm.generate_json(prompt) or {}

        # Execute the planned tool calls
        tool_calls = execution_plan.get("tool_calls", [])
        tool_results: list[dict[str, Any]] = []
        errors: list[str] = []
        recovery_actions: list[str] = []

        for tc in tool_calls:
            tool_name = tc.get("tool") or tc.get("tool_name")
            args = tc.get("arguments", {})

            if not tool_name or tool_name not in self._registry:
                self._log.warning(f"Unknown tool requested: {tool_name}")
                continue

            result = await self.run_tool(tool_name, args)

            if result.success:
                tool_results.append({
                    "tool": tool_name,
                    "arguments": args,
                    "output": result.output,
                    "duration_ms": result.duration_ms,
                })
            else:
                error_msg = f"Tool '{tool_name}' failed: {result.error}"
                errors.append(error_msg)
                self._log.warning(error_msg)

                # Attempt recovery: ask LLM for alternative approach
                alt = await self._attempt_recovery(
                    tool_name, args, result.error or "", task
                )
                if alt:
                    recovery_actions.append(alt.get("action", ""))
                    # Try the alternative tool
                    alt_tool = alt.get("alternative_tool")
                    alt_args = alt.get("alternative_args", {})
                    if alt_tool and alt_tool in self._registry:
                        alt_result = await self.run_tool(alt_tool, alt_args)
                        if alt_result.success:
                            tool_results.append({
                                "tool": alt_tool,
                                "arguments": alt_args,
                                "output": alt_result.output,
                                "duration_ms": alt_result.duration_ms,
                                "recovery": True,
                            })

        # Compose final output
        output: dict[str, Any] = {
            "agent": self.name.value,
            "task": task,
            "thinking": execution_plan.get("thinking", ""),
            "actions_taken": execution_plan.get("actions_taken", []),
            "tool_results": tool_results,
            "output": execution_plan.get("output", {}),
            "success": len(errors) == 0 or len(tool_results) > 0,
            "errors_encountered": errors,
            "recovery_actions": recovery_actions,
        }

        # Self-review
        output = await self.review(output, task)

        # Store execution result
        await self.store_memory(
            f"Executed '{task[:60]}': {len(tool_results)} tools used, "
            f"success={output['success']}, errors={len(errors)}",
            importance=0.7,
            tags=["execution", "result"],
        )

        session.set_agent_output(self.name, output)
        self._log_done(task)
        return output

    # ─── Recovery ────────────────────────────────────────────────────────────

    async def _attempt_recovery(
        self,
        failed_tool: str,
        failed_args: dict,
        error: str,
        task: str,
    ) -> dict[str, Any] | None:
        """Ask the LLM for an alternative approach when a tool fails."""
        tools_desc = self._registry.prompt_descriptions()
        prompt = (
            f"Task: {task}\n\n"
            f"Tool '{failed_tool}' failed with: {error}\n"
            f"Arguments used: {safe_json_dumps(failed_args)[:300]}\n\n"
            f"Available tools:\n{tools_desc}\n\n"
            f"Suggest an alternative approach.\n"
            f"Respond with JSON:\n"
            f'{{"action": "description", "alternative_tool": "tool_name_or_null", '
            f'"alternative_args": {{}}}}'
        )
        return await self._llm.generate_json(prompt)
