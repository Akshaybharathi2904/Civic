"""
tools/file_tool.py
──────────────────
File system tools: read, write, and list files under the workspace directory.
All paths are sandboxed to `settings.workspace_dir` for safety.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from config.settings import settings
from tools.base_tool import BaseTool
from utils.logger import get_logger

log = get_logger(__name__)


def _safe_path(relative_path: str) -> Path:
    """
    Resolve path relative to workspace_dir.
    Raises ValueError if the resolved path escapes the workspace.
    """
    workspace = settings.workspace_dir.resolve()
    resolved = (workspace / relative_path).resolve()
    if not str(resolved).startswith(str(workspace)):
        raise ValueError(f"Path escape attempt blocked: {relative_path}")
    return resolved


# ─── Read ────────────────────────────────────────────────────────────────────

class FileReadTool(BaseTool):
    """Read the contents of a text file inside the workspace directory."""

    @property
    def name(self) -> str:
        return "file_read"

    @property
    def description(self) -> str:
        return "Read the contents of a file. Path is relative to the workspace directory."

    @property
    def parameters_schema(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "Relative path to the file (e.g. 'notes/summary.txt').",
                },
                "max_chars": {
                    "type": "integer",
                    "description": "Maximum number of characters to read.",
                    "default": 10000,
                },
            },
            "required": ["path"],
        }

    async def _run(self, arguments: dict[str, Any]) -> Any:
        path = _safe_path(arguments["path"])
        max_chars: int = arguments.get("max_chars", 10000)

        if not path.exists():
            return {"error": f"File not found: {arguments['path']}", "content": None}

        content = path.read_text(encoding="utf-8", errors="replace")
        if len(content) > max_chars:
            content = content[:max_chars] + f"\n... (truncated at {max_chars} chars)"

        return {
            "path": str(arguments["path"]),
            "size_bytes": path.stat().st_size,
            "content": content,
        }


# ─── Write ───────────────────────────────────────────────────────────────────

class FileWriteTool(BaseTool):
    """Write content to a file inside the workspace directory."""

    @property
    def name(self) -> str:
        return "file_write"

    @property
    def description(self) -> str:
        return (
            "Write text content to a file in the workspace. "
            "Creates the file (and parent dirs) if they don't exist."
        )

    @property
    def parameters_schema(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "Relative path to the file.",
                },
                "content": {
                    "type": "string",
                    "description": "Text content to write.",
                },
                "append": {
                    "type": "boolean",
                    "description": "If true, append to existing content.",
                    "default": False,
                },
            },
            "required": ["path", "content"],
        }

    async def _run(self, arguments: dict[str, Any]) -> Any:
        path = _safe_path(arguments["path"])
        content: str = arguments["content"]
        append: bool = arguments.get("append", False)

        path.parent.mkdir(parents=True, exist_ok=True)
        mode = "a" if append else "w"
        path.write_text(content, encoding="utf-8") if not append else \
            path.open("a", encoding="utf-8").write(content)

        return {
            "path": str(arguments["path"]),
            "bytes_written": len(content.encode("utf-8")),
            "mode": "append" if append else "overwrite",
        }


# ─── List ────────────────────────────────────────────────────────────────────

class FileListTool(BaseTool):
    """List files and directories inside the workspace."""

    @property
    def name(self) -> str:
        return "file_list"

    @property
    def description(self) -> str:
        return "List files and directories in the workspace (or a subdirectory)."

    @property
    def parameters_schema(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "Relative path to list (default: workspace root).",
                    "default": ".",
                },
                "recursive": {
                    "type": "boolean",
                    "description": "If true, list recursively.",
                    "default": False,
                },
            },
        }

    async def _run(self, arguments: dict[str, Any]) -> Any:
        rel_path = arguments.get("path", ".")
        recursive: bool = arguments.get("recursive", False)
        path = _safe_path(rel_path)

        if not path.exists():
            return {"error": f"Path not found: {rel_path}", "entries": []}

        entries: list[dict] = []
        iterator = path.rglob("*") if recursive else path.iterdir()
        for item in sorted(iterator):
            try:
                entries.append({
                    "name": item.name,
                    "path": str(item.relative_to(settings.workspace_dir)),
                    "type": "dir" if item.is_dir() else "file",
                    "size": item.stat().st_size if item.is_file() else None,
                })
            except Exception:
                continue

        return {
            "path": rel_path,
            "entry_count": len(entries),
            "entries": entries[:100],  # cap at 100
        }
