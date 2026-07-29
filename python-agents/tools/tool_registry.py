"""
tools/tool_registry.py
───────────────────────
Central registry for all tools.
Agents look up tools by name and get a prompt-ready description list.
Auto-registers all built-in tools on import.
"""

from __future__ import annotations

from typing import Any

from tools.base_tool import BaseTool
from utils.logger import get_logger

log = get_logger(__name__)


class ToolRegistry:
    """
    Singleton registry.  Register a tool once; use it anywhere.

    Usage::

        registry.register(WebSearchTool())
        tool = registry.get("web_search")
        result = await tool.execute({"query": "..."})
    """

    def __init__(self) -> None:
        self._tools: dict[str, BaseTool] = {}

    def register(self, tool: BaseTool) -> None:
        if tool.name in self._tools:
            log.warning(f"Tool '{tool.name}' already registered — overwriting.")
        self._tools[tool.name] = tool
        log.info(f"Tool registered: '{tool.name}'")

    def register_many(self, tools: list[BaseTool]) -> None:
        for t in tools:
            self.register(t)

    def get(self, name: str) -> BaseTool | None:
        tool = self._tools.get(name)
        if not tool:
            log.warning(f"Tool '{name}' not found in registry.")
        return tool

    def all_tools(self) -> list[BaseTool]:
        return list(self._tools.values())

    def tool_names(self) -> list[str]:
        return list(self._tools.keys())

    def prompt_descriptions(self) -> str:
        """
        Return a bullet-list description of all tools — ready for
        injection into agent system prompts.
        """
        if not self._tools:
            return "(no tools available)"
        return "\n".join(t.to_prompt_description() for t in self._tools.values())

    def function_declarations(self) -> list[dict[str, Any]]:
        """Return Gemini-compatible function declarations for all tools."""
        return [t.to_function_declaration() for t in self._tools.values()]

    def __contains__(self, name: str) -> bool:
        return name in self._tools

    def __len__(self) -> int:
        return len(self._tools)


# ─── Module-level singleton ──────────────────────────────────────────────────
registry = ToolRegistry()


def bootstrap_registry() -> ToolRegistry:
    """
    Register all built-in tools.  Called once at startup in main.py.
    Returns the populated registry.
    """
    from tools.web_search_tool import WebSearchTool
    from tools.file_tool import FileReadTool, FileWriteTool, FileListTool
    from tools.code_tool import PythonCodeTool
    from tools.calculator_tool import CalculatorTool

    registry.register_many([
        WebSearchTool(),
        FileReadTool(),
        FileWriteTool(),
        FileListTool(),
        PythonCodeTool(),
        CalculatorTool(),
    ])

    log.info(f"Tool registry ready: {registry.tool_names()}")
    return registry
