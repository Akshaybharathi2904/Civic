"""
agents/validator.py
────────────────────
Validation Agent — critically reviews outputs and enforces quality.

Responsibilities:
  - Evaluate completeness, accuracy, and quality of any agent's output
  - Assign a numeric quality score (0.0 – 1.0)
  - List specific issues and improvement suggestions
  - Decide whether output needs to go back for revision
"""

from __future__ import annotations

from typing import Any

from agents.base_agent import BaseAgent
from config.settings import settings
from models.schemas import (
    AgentMessage,
    AgentName,
    ValidationResult,
    WorkflowSession,
)
from prompts.system_prompts import VALIDATOR_SYSTEM
from prompts.agent_prompts import validator_prompt
from utils.helpers import safe_json_dumps


class ValidatorAgent(BaseAgent):

    @property
    def name(self) -> AgentName:
        return AgentName.VALIDATOR

    def __init__(self, **kwargs: Any) -> None:
        super().__init__(system_prompt=VALIDATOR_SYSTEM, **kwargs)

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

        # What to validate — from payload or pull latest agent outputs
        target_output = payload.get("output_to_validate")
        target_agent = payload.get("target_agent")
        criteria = payload.get("criteria")

        if not target_output:
            # Validate the last significant agent output
            target_output = self._get_best_output(session, target_agent)

        original_task = payload.get("original_task", session.initial_task)

        # Think first
        await self.think(
            f"I need to validate output for task: '{original_task}'. "
            f"What are the most important quality dimensions to check?"
        )

        prompt = validator_prompt(
            original_task=original_task,
            agent_output=target_output,
            context=context,
            validation_criteria=criteria,
        )

        raw_result = await self._llm.generate_json(prompt) or {}

        # Parse scores
        criterion_scores = raw_result.get("criterion_scores", {})
        overall_score = raw_result.get("score", 0.5)
        if not isinstance(overall_score, (int, float)):
            overall_score = 0.5

        # Derive retry decision
        should_retry = raw_result.get("should_retry", False)
        if overall_score < settings.min_validation_score and not should_retry:
            should_retry = True
            self._log.warning(
                f"Score {overall_score:.2f} < threshold {settings.min_validation_score} "
                f"→ mandating retry"
            )

        # Resolve retry agent
        retry_agent_str = raw_result.get("retry_agent")
        retry_agent = None
        if retry_agent_str:
            try:
                retry_agent = AgentName(retry_agent_str)
            except ValueError:
                retry_agent = AgentName.EXECUTOR

        validation = ValidationResult(
            valid=raw_result.get("valid", overall_score >= settings.min_validation_score),
            score=min(max(float(overall_score), 0.0), 1.0),
            issues=raw_result.get("issues", []),
            suggestions=raw_result.get("suggestions", []),
            reasoning=raw_result.get("thinking", ""),
            should_retry=should_retry,
            retry_agent=retry_agent,
        )

        session.validation_results.append(validation)
        await self._shared_memory.set_validation(validation.model_dump())

        # Log result
        status_icon = "✓" if validation.valid else "✗"
        self._log.info(
            f"{status_icon} Validation score={validation.score:.2f} "
            f"valid={validation.valid} retry={should_retry} "
            f"issues={len(validation.issues)}"
        )

        # Store in memory
        await self.store_memory(
            f"Validation of '{original_task[:50]}': score={validation.score:.2f}, "
            f"issues={validation.issues[:2]}",
            importance=0.8,
            tags=["validation", "score"],
        )

        output = {
            "agent": self.name.value,
            "task": task,
            "original_task": original_task,
            "validation": validation.model_dump(),
            "criterion_scores": criterion_scores,
            "retry_instructions": raw_result.get("retry_instructions"),
        }

        session.set_agent_output(self.name, output)
        self._log_done(task)
        return output

    # ─── Helper ──────────────────────────────────────────────────────────────

    def _get_best_output(
        self,
        session: WorkflowSession,
        target_agent: str | None,
    ) -> dict[str, Any]:
        """Get the most meaningful output to validate from the session."""
        if target_agent:
            try:
                agent = AgentName(target_agent)
                output = session.get_agent_output(agent)
                if output:
                    return output
            except ValueError:
                pass

        # Priority order: executor > decision > researcher > reporter
        for agent in [AgentName.EXECUTOR, AgentName.DECISION, AgentName.RESEARCHER]:
            out = session.get_agent_output(agent)
            if out:
                return out

        return {"note": "no prior agent output found"}
