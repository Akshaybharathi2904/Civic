"""
utils/helpers.py
────────────────
Shared utility functions used across the system:
  - JSON extraction from LLM text
  - Retry decorator with exponential backoff
  - UUID generation
  - Timestamp helpers
  - Safe dict merging
"""

from __future__ import annotations

import asyncio
import functools
import json
import re
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Callable, TypeVar

from tenacity import (
    AsyncRetrying,
    RetryError,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)

from config.settings import settings
from utils.logger import get_logger

log = get_logger(__name__)

F = TypeVar("F", bound=Callable[..., Any])


# ─── UUID / Timestamps ───────────────────────────────────────────────────────

def new_id() -> str:
    """Generate a short UUID4 string."""
    return str(uuid.uuid4())


def utcnow() -> str:
    """Return current UTC time as ISO-8601 string."""
    return datetime.now(tz=timezone.utc).isoformat()


def timestamp_ms() -> int:
    """Return current Unix time in milliseconds."""
    return int(time.time() * 1000)


# ─── JSON extraction ────────────────────────────────────────────────────────

def extract_json(text: str) -> dict | list | None:
    """
    Robustly extract the first JSON object or array from an LLM response.
    Handles markdown code-fences (```json ... ```) and bare JSON blocks.

    Returns None if no valid JSON is found.
    """
    # 1. Try markdown fence  ```json ... ```
    fence_match = re.search(
        r"```(?:json)?\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```",
        text,
        re.DOTALL | re.IGNORECASE,
    )
    if fence_match:
        try:
            return json.loads(fence_match.group(1))
        except json.JSONDecodeError:
            pass

    # 2. Try to find a raw JSON object in the text
    brace_match = re.search(r"\{[\s\S]*\}", text)
    if brace_match:
        try:
            return json.loads(brace_match.group())
        except json.JSONDecodeError:
            pass

    # 3. Try the whole text
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        return None


def safe_json_dumps(obj: Any, indent: int = 2) -> str:
    """Serialize obj to JSON; fall back to str() for un-serialisable types."""
    try:
        return json.dumps(obj, indent=indent, default=str)
    except Exception:
        return str(obj)


# ─── Retry decorator ─────────────────────────────────────────────────────────

def async_retry(
    max_attempts: int | None = None,
    exceptions: tuple[type[Exception], ...] = (Exception,),
) -> Callable[[F], F]:
    """
    Decorator that retries an async function with exponential backoff.

    Usage::

        @async_retry(max_attempts=3)
        async def call_llm(...):
            ...
    """
    attempts = max_attempts or settings.max_retries

    def decorator(fn: F) -> F:
        @functools.wraps(fn)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            try:
                async for attempt in AsyncRetrying(
                    stop=stop_after_attempt(attempts),
                    wait=wait_exponential(
                        multiplier=settings.retry_backoff_base,
                        min=1,
                        max=30,
                    ),
                    retry=retry_if_exception_type(exceptions),
                    reraise=True,
                ):
                    with attempt:
                        return await fn(*args, **kwargs)
            except RetryError as e:
                log.error(f"[retry] All {attempts} attempts failed for {fn.__name__}: {e}")
                raise

        return wrapper  # type: ignore[return-value]

    return decorator


# ─── Dict helpers ────────────────────────────────────────────────────────────

def deep_merge(base: dict, override: dict) -> dict:
    """
    Recursively merge *override* into *base*.
    Lists are replaced (not extended).
    """
    result = dict(base)
    for key, val in override.items():
        if key in result and isinstance(result[key], dict) and isinstance(val, dict):
            result[key] = deep_merge(result[key], val)
        else:
            result[key] = val
    return result


def truncate(text: str, max_chars: int = 2000) -> str:
    """Truncate a string to *max_chars*, appending '…' if cut."""
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + "…"


def flatten_context(context: dict, depth: int = 0, max_depth: int = 2) -> str:
    """
    Convert a nested context dict to a human-readable bullet list
    suitable for inclusion in prompts.
    """
    if depth > max_depth:
        return "  " * depth + "(truncated)\n"

    lines: list[str] = []
    indent = "  " * depth
    for key, val in context.items():
        if isinstance(val, dict):
            lines.append(f"{indent}• {key}:")
            lines.append(flatten_context(val, depth + 1, max_depth))
        elif isinstance(val, list):
            items = val[:5]  # show first 5
            lines.append(f"{indent}• {key}: [{', '.join(str(i) for i in items)}]")
        else:
            lines.append(f"{indent}• {key}: {truncate(str(val), 200)}")
    return "\n".join(lines)
