"""
memory/shared_memory.py
───────────────────────
Cross-agent shared context store (a.k.a. the "blackboard").
All agents can read/write here to communicate facts discovered
during the session.  Thread-safe via asyncio.Lock.
"""

from __future__ import annotations

import asyncio
import json
from typing import Any

from utils.helpers import utcnow, new_id
from utils.logger import get_logger

log = get_logger(__name__)


class SharedMemory:
    """
    Global key-value blackboard accessible to all agents.

    Features
    --------
    - Namespaced keys:  "planner:step_count", "researcher:sources", etc.
    - Full history per key (every write is versioned)
    - Snapshot / restore
    - Async-safe via asyncio.Lock
    """

    def __init__(self, max_entries: int = 1000) -> None:
        self._store: dict[str, Any] = {}
        self._history: dict[str, list[dict[str, Any]]] = {}
        self._max_entries = max_entries
        self._lock = asyncio.Lock()
        self._write_count = 0

    # ─── Write ───────────────────────────────────────────────────────────────

    async def set(
        self,
        key: str,
        value: Any,
        *,
        written_by: str = "unknown",
        metadata: dict[str, Any] | None = None,
    ) -> None:
        """Write a value to the shared memory under *key*."""
        async with self._lock:
            self._store[key] = value
            record = {
                "value": value,
                "written_by": written_by,
                "timestamp": utcnow(),
                "metadata": metadata or {},
            }
            self._history.setdefault(key, []).append(record)
            self._write_count += 1

            # Evict oldest if over limit
            if len(self._store) > self._max_entries:
                oldest_key = next(iter(self._store))
                del self._store[oldest_key]
                self._history.pop(oldest_key, None)
                log.warning(f"SharedMemory evicted oldest key '{oldest_key}'")

            log.debug(f"SharedMemory['{key}'] set by {written_by}")

    async def update(self, key: str, partial: dict, *, written_by: str = "unknown") -> None:
        """Merge *partial* dict into an existing dict value at *key*."""
        async with self._lock:
            existing = self._store.get(key, {})
            if isinstance(existing, dict):
                existing.update(partial)
                self._store[key] = existing
            else:
                self._store[key] = partial
            log.debug(f"SharedMemory['{key}'] updated by {written_by}")

    # ─── Read ────────────────────────────────────────────────────────────────

    async def get(self, key: str, default: Any = None) -> Any:
        async with self._lock:
            return self._store.get(key, default)

    async def get_all(self) -> dict[str, Any]:
        async with self._lock:
            return dict(self._store)

    async def get_history(self, key: str) -> list[dict[str, Any]]:
        async with self._lock:
            return list(self._history.get(key, []))

    async def keys(self) -> list[str]:
        async with self._lock:
            return list(self._store.keys())

    # ─── Namespaced helpers ──────────────────────────────────────────────────

    async def set_agent_output(self, agent_name: str, output: Any) -> None:
        await self.set(f"agent_output:{agent_name}", output, written_by=agent_name)

    async def get_agent_output(self, agent_name: str) -> Any:
        return await self.get(f"agent_output:{agent_name}")

    async def set_plan(self, plan_dict: dict) -> None:
        await self.set("workflow:plan", plan_dict, written_by="PlannerAgent")

    async def get_plan(self) -> dict | None:
        return await self.get("workflow:plan")

    async def set_research(self, research: dict) -> None:
        await self.set("workflow:research", research, written_by="ResearchAgent")

    async def get_research(self) -> dict | None:
        return await self.get("workflow:research")

    async def set_decision(self, decision: dict) -> None:
        await self.set("workflow:decision", decision, written_by="DecisionAgent")

    async def get_decision(self) -> dict | None:
        return await self.get("workflow:decision")

    async def set_validation(self, validation: dict) -> None:
        await self.set("workflow:validation", validation, written_by="ValidatorAgent")

    async def get_validation(self) -> dict | None:
        return await self.get("workflow:validation")

    # ─── Snapshot / Export ───────────────────────────────────────────────────

    async def snapshot(self) -> dict[str, Any]:
        """Return a complete immutable snapshot of all current values."""
        return await self.get_all()

    async def to_prompt_str(self, max_keys: int = 20) -> str:
        """Format shared memory as a bullet list for prompt injection."""
        store = await self.get_all()
        lines = ["=== Shared Memory ==="]
        for i, (k, v) in enumerate(list(store.items())[:max_keys]):
            val_str = json.dumps(v, default=str)[:200]
            lines.append(f"  • {k}: {val_str}")
        if len(store) > max_keys:
            lines.append(f"  … and {len(store) - max_keys} more keys")
        return "\n".join(lines)

    @property
    def write_count(self) -> int:
        return self._write_count

    async def clear(self) -> None:
        async with self._lock:
            self._store.clear()
            self._history.clear()
            self._write_count = 0
        log.info("SharedMemory cleared")


# ─── Module-level singleton ──────────────────────────────────────────────────
# Each WorkflowSession creates its own; this is the default global instance.
shared_memory = SharedMemory()
