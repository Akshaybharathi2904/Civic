"""
tools/base_tool.py
──────────────────
Abstract base class for all tools.
Every tool must implement:
  - name  (str property)
  - description  (str property)
  - parameters_schema  (dict describing arguments — OpenAI function-call style)
  - _run(arguments)  (async implementation)
"""

from __future__ import annotations

import time
from abc import ABC, abstractmethod
from typing import Any

from models.schemas import ToolCall, ToolResult
from utils.helpers import new_id, utcnow
from utils.logger import get_logger

log = get_logger(__name__)


class BaseTool(ABC):
    """
    Abstract tool interface.

    Subclass this and implement `name`, `description`,
    `parameters_schema`, and `_run`.
    """

    # ─── Abstract interface ──────────────────────────────────────────────────

    @property
    @abstractmethod
    def name(self) -> str:
        """Unique tool identifier used by agents to select this tool."""
        ...

    @property
    @abstractmethod
    def description(self) -> str:
        """
        Human-readable description that the LLM uses to decide
        whether to call this tool.
        """
        ...

    @property
    @abstractmethod
    def parameters_schema(self) -> dict[str, Any]:
        """
        JSON Schema describing the arguments this tool accepts.
        Format mirrors OpenAI function-calling / Gemini function declarations.

        Example::

            {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query"},
                },
                "required": ["query"],
            }
        """
        ...

    @abstractmethod
    async def _run(self, arguments: dict[str, Any]) -> Any:
        """
        Core implementation.  Receive *arguments* dict, return any result.
        Raise an exception on failure — the framework will catch it.
        """
        ...

    # ─── Public execute ──────────────────────────────────────────────────────

    async def execute(
        self,
        arguments: dict[str, Any],
        *,
        call_id: str | None = None,
    ) -> ToolResult:
        """
        Execute the tool with *arguments*.
        Returns a ToolResult (success or failure) — never raises.
        """
        cid = call_id or new_id()
        start = time.monotonic()

        log.info(f"[Tool:{self.name}] Executing with args={arguments}")

        try:
            output = await self._run(arguments)
            elapsed = int((time.monotonic() - start) * 1000)
            log.info(f"[Tool:{self.name}] ✓ Completed in {elapsed}ms")
            return ToolResult(
                call_id=cid,
                tool_name=self.name,
                success=True,
                output=output,
                duration_ms=elapsed,
            )
        except Exception as exc:
            elapsed = int((time.monotonic() - start) * 1000)
            log.error(f"[Tool:{self.name}] ✗ Failed: {exc}")
            return ToolResult(
                call_id=cid,
                tool_name=self.name,
                success=False,
                output=None,
                error=str(exc),
                duration_ms=elapsed,
            )

    # ─── Prompt helpers ──────────────────────────────────────────────────────

    def to_prompt_description(self) -> str:
        """Return a compact string that can be injected into agent prompts."""
        params = ", ".join(
            self.parameters_schema.get("properties", {}).keys()
        )
        return f"• {self.name}({params}) — {self.description}"

    def to_function_declaration(self) -> dict[str, Any]:
        """Return Gemini-compatible function declaration."""
        return {
            "name": self.name,
            "description": self.description,
            "parameters": self.parameters_schema,
        }
