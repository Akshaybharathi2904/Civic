"""
tools/code_tool.py
──────────────────
Sandboxed Python code execution tool.
Runs code in a subprocess with a configurable timeout.
stdout/stderr are captured and returned.
"""

from __future__ import annotations

import asyncio
import sys
import tempfile
import textwrap
from pathlib import Path
from typing import Any

from config.settings import settings
from tools.base_tool import BaseTool
from utils.logger import get_logger

log = get_logger(__name__)

# Blocked imports to prevent sandbox escapes
_BLOCKED_MODULES = {
    "os", "subprocess", "sys", "socket", "shutil",
    "multiprocessing", "threading", "ctypes", "importlib",
    "_thread", "signal", "pty", "popen",
}


def _contains_blocked_import(code: str) -> bool:
    for mod in _BLOCKED_MODULES:
        if f"import {mod}" in code or f"from {mod}" in code:
            return True
    return False


class PythonCodeTool(BaseTool):
    """
    Execute a Python code snippet in an isolated subprocess.
    Returns stdout, stderr, and the exit code.
    Dangerous imports (os, subprocess, etc.) are rejected.
    """

    @property
    def name(self) -> str:
        return "python_code"

    @property
    def description(self) -> str:
        return (
            "Execute a Python code snippet and return its output. "
            "Useful for calculations, data transformations, or generating artefacts. "
            "Restricted: os, subprocess, socket and similar modules are blocked."
        )

    @property
    def parameters_schema(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "description": "Valid Python code to execute.",
                },
                "timeout": {
                    "type": "integer",
                    "description": f"Max execution time in seconds (default {settings.code_execution_timeout}).",
                },
            },
            "required": ["code"],
        }

    async def _run(self, arguments: dict[str, Any]) -> Any:
        code: str = arguments["code"]
        timeout: int = arguments.get("timeout", settings.code_execution_timeout)

        # Safety check
        if _contains_blocked_import(code):
            return {
                "success": False,
                "stdout": "",
                "stderr": "Blocked: code contains a restricted module import.",
                "exit_code": 1,
            }

        # Write code to a temp file
        with tempfile.NamedTemporaryFile(
            mode="w",
            suffix=".py",
            prefix="agent_code_",
            delete=False,
            encoding="utf-8",
        ) as f:
            f.write(code)
            tmp_path = f.name

        try:
            proc = await asyncio.create_subprocess_exec(
                sys.executable, tmp_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            try:
                stdout_bytes, stderr_bytes = await asyncio.wait_for(
                    proc.communicate(), timeout=float(timeout)
                )
                exit_code = proc.returncode
            except asyncio.TimeoutError:
                proc.kill()
                return {
                    "success": False,
                    "stdout": "",
                    "stderr": f"Execution timed out after {timeout}s",
                    "exit_code": -1,
                }

            stdout = stdout_bytes.decode("utf-8", errors="replace")[:5000]
            stderr = stderr_bytes.decode("utf-8", errors="replace")[:2000]

            return {
                "success": exit_code == 0,
                "stdout": stdout,
                "stderr": stderr,
                "exit_code": exit_code,
            }
        finally:
            Path(tmp_path).unlink(missing_ok=True)
