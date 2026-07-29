"""
utils/logger.py
───────────────
Structured logging with colour-coded console output (pretty mode)
or machine-readable JSON lines (json mode).  Every agent log line
includes: timestamp, level, agent_name, session_id, and message.
"""

from __future__ import annotations

import json
import logging
import sys
import traceback
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from rich.console import Console
from rich.logging import RichHandler
from rich.theme import Theme

from config.settings import settings

# ─── Rich console theme ─────────────────────────────────────────────────────
_THEME = Theme(
    {
        "agent.orchestrator": "bold magenta",
        "agent.planner": "bold cyan",
        "agent.researcher": "bold blue",
        "agent.decision": "bold yellow",
        "agent.executor": "bold green",
        "agent.validator": "bold red",
        "agent.reporter": "bold white",
        "agent.memory": "bold dim",
        "tool": "italic green",
        "warn": "yellow",
        "error": "bold red",
    }
)

_console = Console(theme=_THEME, stderr=True)


# ─── JSON formatter ─────────────────────────────────────────────────────────
class _JsonFormatter(logging.Formatter):
    """Emit log records as single-line JSON objects."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        for key in ("agent_name", "session_id", "task_id", "round"):
            if hasattr(record, key):
                payload[key] = getattr(record, key)

        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        return json.dumps(payload, ensure_ascii=False)


# ─── Factory ────────────────────────────────────────────────────────────────
def get_logger(
    name: str,
    *,
    agent_name: str | None = None,
    session_id: str | None = None,
) -> "AgentLogger":
    """
    Return a configured logger.  Call once per module / agent instance.

    Usage::

        log = get_logger(__name__, agent_name="PlannerAgent")
        log.info("Plan created", extra={"task_id": "t-123"})
    """
    logger = logging.getLogger(name)

    if logger.handlers:
        return AgentLogger(logger, agent_name=agent_name, session_id=session_id)

    logger.setLevel(getattr(logging, settings.log_level))

    # Console handler
    if settings.log_format == "pretty":
        console_handler = RichHandler(
            console=_console,
            show_time=True,
            show_path=False,
            rich_tracebacks=True,
            markup=True,
        )
        console_handler.setFormatter(logging.Formatter("%(message)s"))
    else:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(_JsonFormatter())

    logger.addHandler(console_handler)

    # File handler (always JSON)
    log_path = settings.logs_dir / Path(settings.log_file).name
    file_handler = logging.FileHandler(log_path, encoding="utf-8")
    file_handler.setFormatter(_JsonFormatter())
    logger.addHandler(file_handler)

    logger.propagate = False
    return AgentLogger(logger, agent_name=agent_name, session_id=session_id)


class AgentLogger:
    """
    Thin wrapper around stdlib Logger that automatically injects
    agent_name and session_id into every log record's `extra` dict.
    """

    def __init__(
        self,
        logger: logging.Logger,
        *,
        agent_name: str | None = None,
        session_id: str | None = None,
    ) -> None:
        self._logger = logger
        self._extra: dict[str, Any] = {}
        if agent_name:
            self._extra["agent_name"] = agent_name
        if session_id:
            self._extra["session_id"] = session_id

    def _merge(self, extra: dict | None) -> dict:
        merged = dict(self._extra)
        if extra:
            merged.update(extra)
        return merged

    def debug(self, msg: str, extra: dict | None = None, **kw: Any) -> None:
        self._logger.debug(msg, extra=self._merge(extra), **kw)

    def info(self, msg: str, extra: dict | None = None, **kw: Any) -> None:
        self._logger.info(msg, extra=self._merge(extra), **kw)

    def warning(self, msg: str, extra: dict | None = None, **kw: Any) -> None:
        self._logger.warning(msg, extra=self._merge(extra), **kw)

    def error(self, msg: str, extra: dict | None = None, **kw: Any) -> None:
        self._logger.error(msg, extra=self._merge(extra), **kw)

    def critical(self, msg: str, extra: dict | None = None, **kw: Any) -> None:
        self._logger.critical(msg, extra=self._merge(extra), **kw)

    def exception(self, msg: str, exc: Exception | None = None, extra: dict | None = None) -> None:
        self._logger.error(
            msg,
            exc_info=exc or True,
            extra=self._merge(extra),
        )

    def bind(self, **kwargs: Any) -> "AgentLogger":
        """Return a new logger with additional fixed context fields."""
        new = AgentLogger(self._logger)
        new._extra = {**self._extra, **kwargs}
        return new
