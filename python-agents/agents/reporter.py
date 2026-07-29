"""
agents/reporter.py
──────────────────
Reporter Agent — synthesises all agent outputs into a final report.

Responsibilities:
  - Collect outputs from all agents in the session
  - Write a coherent, professional final report
  - Include executive summary, findings, recommendations, next steps
  - Save the report to the workspace as a file
"""

from __future__ import annotations

from typing import Any

from agents.base_agent import BaseAgent
from models.schemas import AgentMessage, AgentName, AgentReport, WorkflowSession
from prompts.system_prompts import REPORTER_SYSTEM
from prompts.agent_prompts import reporter_prompt
from utils.helpers import safe_json_dumps, utcnow, new_id


class ReporterAgent(BaseAgent):

    @property
    def name(self) -> AgentName:
        return AgentName.REPORTER

    def __init__(self, **kwargs: Any) -> None:
        super().__init__(system_prompt=REPORTER_SYSTEM, **kwargs)

    async def execute(
        self,
        message: AgentMessage,
        session: WorkflowSession,
    ) -> dict[str, Any]:
        self.set_session(session)
        self._log_start(message.task)

        # Gather all agent outputs from session
        all_outputs = dict(session.agent_outputs)
        validation = await self._shared_memory.get_validation() or {}

        session_summary = session.get_context_summary()
        session_summary["initial_task"] = session.initial_task
        session_summary["message_count"] = len(session.messages)
        session_summary["tool_calls"] = len(session.tool_calls)

        prompt = reporter_prompt(
            session_summary=session_summary,
            all_outputs=all_outputs,
            validation_result=validation,
        )

        raw_report = await self._llm.generate_json(prompt) or {}

        # Build typed AgentReport
        report = AgentReport(
            session_id=session.session_id,
            title=raw_report.get("title", f"Report: {session.initial_task[:60]}"),
            summary=raw_report.get("executive_summary", ""),
            findings=raw_report.get("findings", []),
            recommendations=raw_report.get("recommendations", []),
            plan=session.plan,
            tool_calls=session.tool_calls,
            reasoning_chain=session.reasoning_chain,
            metadata={
                "next_steps": raw_report.get("next_steps", []),
                "confidence_level": raw_report.get("confidence_level", "medium"),
                "caveats": raw_report.get("caveats", []),
                "analysis": raw_report.get("analysis", ""),
            },
        )

        session.final_report = report

        # Save report to file
        report_filename = f"report_{session.session_id[:8]}_{utcnow()[:10]}.md"
        report_content = self._format_markdown(report, raw_report)

        save_result = await self.run_tool(
            "file_write",
            {"path": f"reports/{report_filename}", "content": report_content},
        )

        if save_result.success:
            self._log.info(f"Report saved to: reports/{report_filename}")
        else:
            self._log.warning(f"Failed to save report: {save_result.error}")

        # Store summary in memory
        await self.store_memory(
            f"Final report for '{session.initial_task[:60]}': {report.summary[:200]}",
            importance=1.0,
            tags=["report", "final"],
        )

        output = {
            "agent": self.name.value,
            "report_id": report.report_id,
            "title": report.title,
            "summary": report.summary,
            "findings": report.findings,
            "recommendations": report.recommendations,
            "next_steps": raw_report.get("next_steps", []),
            "confidence_level": raw_report.get("confidence_level", "medium"),
            "report_file": f"reports/{report_filename}" if save_result.success else None,
            "full_report": report.model_dump(),
        }

        session.set_agent_output(self.name, output)
        self._log_done(message.task)
        return output

    # ─── Markdown formatter ───────────────────────────────────────────────────

    def _format_markdown(
        self,
        report: AgentReport,
        raw: dict[str, Any],
    ) -> str:
        lines: list[str] = [
            f"# {report.title}",
            f"\n**Session ID:** `{report.session_id}`",
            f"**Generated:** {utcnow()[:19]} UTC",
            f"\n---\n",
            "## Executive Summary\n",
            report.summary,
            "\n## Key Findings\n",
        ]

        for i, finding in enumerate(report.findings, 1):
            lines.append(f"{i}. {finding}")

        lines += ["\n## Analysis\n", raw.get("analysis", "(no analysis provided)")]
        lines += ["\n## Recommendations\n"]
        for i, rec in enumerate(report.recommendations, 1):
            lines.append(f"{i}. {rec}")

        next_steps = raw.get("next_steps", [])
        if next_steps:
            lines += ["\n## Next Steps\n"]
            for s in next_steps:
                lines.append(f"- {s}")

        caveats = raw.get("caveats", [])
        if caveats:
            lines += ["\n## Caveats\n"]
            for c in caveats:
                lines.append(f"> ⚠️ {c}")

        lines += [
            "\n---",
            f"\n**Confidence Level:** {raw.get('confidence_level', 'medium').upper()}",
            f"\n*Generated by AgentVerse Autonomous Multi-Agent System*",
        ]

        return "\n".join(lines)
