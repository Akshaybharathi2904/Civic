"""
agents/planner.py
──────────────────
Planner Agent — breaks complex tasks into structured execution plans.

Responsibilities:
  - Analyse the task scope
  - Create a multi-step ExecutionPlan with dependencies
  - Assign steps to appropriate agents
  - Replan if the workflow fails partway through
"""

from __future__ import annotations

from typing import Any

from agents.base_agent import BaseAgent
from models.schemas import (
    AgentMessage,
    AgentName,
    ExecutionPlan,
    PlanStep,
    TaskStatus,
    WorkflowSession,
)
from prompts.system_prompts import PLANNER_SYSTEM
from prompts.agent_prompts import planner_create_plan_prompt, planner_replan_prompt
from utils.helpers import safe_json_dumps


class PlannerAgent(BaseAgent):

    @property
    def name(self) -> AgentName:
        return AgentName.PLANNER

    def __init__(self, **kwargs: Any) -> None:
        super().__init__(system_prompt=PLANNER_SYSTEM, **kwargs)

    async def execute(
        self,
        message: AgentMessage,
        session: WorkflowSession,
    ) -> dict[str, Any]:
        self.set_session(session)
        self._log_start(message.task)

        payload = message.payload
        replan = payload.get("replan", False)

        if replan:
            result = await self._replan(session, payload)
        else:
            result = await self._create_plan(message, session)

        # Persist plan to shared memory
        if result.get("plan"):
            await self._shared_memory.set_plan(result["plan"])

        # Store in agent memory
        await self.store_memory(
            f"Created plan: {result.get('plan', {}).get('title', 'unknown')} "
            f"with {len(result.get('plan', {}).get('steps', []))} steps",
            importance=0.9,
            tags=["plan", "created"],
        )

        self._log_done(message.task)
        return result

    # ─── Create Plan ─────────────────────────────────────────────────────────

    async def _create_plan(
        self,
        message: AgentMessage,
        session: WorkflowSession,
    ) -> dict[str, Any]:
        objective = message.task
        context = message.context

        # Get memory context
        memory_ctx = await self._memory.working_memory_as_text()

        # Available agents (excluding orchestrator from being assigned steps)
        available_agents = [
            AgentName.RESEARCHER.value,
            AgentName.DECISION.value,
            AgentName.EXECUTOR.value,
            AgentName.VALIDATOR.value,
            AgentName.REPORTER.value,
            AgentName.MEMORY.value,
        ]

        tools_desc = self._registry.prompt_descriptions()

        # Internal thinking step
        await self.think(
            f"I need to plan how to accomplish: '{objective}'. "
            f"What are the key phases? What are the risks?"
        )

        prompt = planner_create_plan_prompt(
            objective=objective,
            context=context,
            available_agents=available_agents,
            available_tools=tools_desc,
            memory_context=memory_ctx,
        )

        raw_plan = await self._llm.generate_json(prompt) or {}

        # Build typed ExecutionPlan
        steps: list[PlanStep] = []
        for i, raw_step in enumerate(raw_plan.get("steps", [])):
            # Resolve agent name
            agent_str = raw_step.get("assigned_agent", AgentName.EXECUTOR.value)
            try:
                assigned = AgentName(agent_str)
            except ValueError:
                assigned = AgentName.EXECUTOR

            step = PlanStep(
                step_id=raw_step.get("step_id", f"step_{i + 1}"),
                title=raw_step.get("title", f"Step {i + 1}"),
                description=raw_step.get("description", ""),
                assigned_agent=assigned,
                dependencies=raw_step.get("dependencies", []),
                tools_required=raw_step.get("tools_required", []),
                expected_output=raw_step.get("expected_output", ""),
            )
            steps.append(step)

        plan = ExecutionPlan(
            title=raw_plan.get("title", f"Plan: {objective[:60]}"),
            objective=objective,
            steps=steps,
            session_id=session.session_id,
        )

        session.plan = plan
        self._log.info(
            f"Plan created: '{plan.title}' | {len(steps)} steps"
        )

        return {
            "agent": self.name.value,
            "plan": plan.model_dump(),
            "analysis": raw_plan.get("analysis", ""),
            "risks": raw_plan.get("risks", []),
            "success_criteria": raw_plan.get("success_criteria", []),
            "step_count": len(steps),
        }

    # ─── Replan ──────────────────────────────────────────────────────────────

    async def _replan(
        self,
        session: WorkflowSession,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        self._log.info("Replanning due to failure...")

        failure_context = payload.get("failure_context", {})
        completed = [
            step.step_id
            for step in (session.plan.steps if session.plan else [])
            if step.status == TaskStatus.COMPLETED
        ]
        original_plan = session.plan.model_dump() if session.plan else {}

        prompt = planner_replan_prompt(
            original_plan=original_plan,
            failure_context=failure_context,
            completed_steps=completed,
        )

        raw_plan = await self._llm.generate_json(prompt) or {}
        steps: list[PlanStep] = []

        for i, raw_step in enumerate(raw_plan.get("steps", [])):
            agent_str = raw_step.get("assigned_agent", AgentName.EXECUTOR.value)
            try:
                assigned = AgentName(agent_str)
            except ValueError:
                assigned = AgentName.EXECUTOR

            step = PlanStep(
                step_id=raw_step.get("step_id", f"step_{i + 1}"),
                title=raw_step.get("title", f"Step {i + 1}"),
                description=raw_step.get("description", ""),
                assigned_agent=assigned,
                dependencies=raw_step.get("dependencies", []),
                tools_required=raw_step.get("tools_required", []),
                expected_output=raw_step.get("expected_output", ""),
            )
            steps.append(step)

        new_plan = ExecutionPlan(
            title=raw_plan.get("title", "Revised Plan"),
            objective=original_plan.get("objective", ""),
            steps=steps,
            session_id=session.session_id,
        )
        session.plan = new_plan

        self._log.info(f"Replan complete: {len(steps)} steps")
        return {
            "agent": self.name.value,
            "plan": new_plan.model_dump(),
            "replanned": True,
            "step_count": len(steps),
        }
