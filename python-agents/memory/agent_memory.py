"""
memory/agent_memory.py
──────────────────────
Per-agent episodic + working memory.

• Working memory  — in-memory list of recent entries (fast access)
• Episodic memory — chronological record of all events in the session
• Retrieval       — TF-IDF similarity search over stored entries
"""

from __future__ import annotations

import json
from collections import deque
from typing import Any

from models.schemas import AgentName, MemoryEntry
from utils.helpers import new_id, utcnow, truncate
from utils.logger import get_logger

log = get_logger(__name__)


class AgentMemory:
    """
    Individual memory store per agent.
    Supports store / retrieve / summarise / clear.
    """

    def __init__(
        self,
        agent_name: AgentName,
        *,
        max_entries: int = 200,
        working_window: int = 20,
    ) -> None:
        self.agent_name = agent_name
        self._max_entries = max_entries
        self._log = log.bind(agent_name=agent_name.value)

        # All episodic memories (most recent → oldest order preserved)
        self._episodic: list[MemoryEntry] = []

        # Working memory: small sliding window of the most recent entries
        self._working: deque[MemoryEntry] = deque(maxlen=working_window)

    # ─── Store ───────────────────────────────────────────────────────────────

    def store(
        self,
        content: str,
        *,
        metadata: dict[str, Any] | None = None,
        importance: float = 0.5,
        tags: list[str] | None = None,
        session_id: str | None = None,
    ) -> MemoryEntry:
        """Persist a memory entry and add it to the working window."""
        entry = MemoryEntry(
            agent_name=self.agent_name,
            content=truncate(content, 4000),
            metadata=metadata or {},
            importance=importance,
            tags=tags or [],
            session_id=session_id,
        )

        self._episodic.append(entry)
        self._working.append(entry)

        # Evict oldest if over capacity
        if len(self._episodic) > self._max_entries:
            self._episodic.pop(0)

        self._log.debug(
            f"Memory stored [{entry.entry_id[:8]}] importance={importance:.2f} "
            f"tags={tags}"
        )
        return entry

    # ─── Retrieve ────────────────────────────────────────────────────────────

    def retrieve_recent(self, n: int = 10) -> list[MemoryEntry]:
        """Return the n most recent entries."""
        return list(self._episodic[-n:])

    def retrieve_working(self) -> list[MemoryEntry]:
        """Return the current working-memory window."""
        return list(self._working)

    def retrieve_by_tags(self, tags: list[str]) -> list[MemoryEntry]:
        """Return entries whose tag set intersects with the given tags."""
        tag_set = set(tags)
        return [e for e in self._episodic if tag_set & set(e.tags)]

    def retrieve_by_importance(self, min_importance: float = 0.7) -> list[MemoryEntry]:
        """Return entries above a minimum importance threshold."""
        return [e for e in self._episodic if e.importance >= min_importance]

    def search(self, query: str, top_k: int = 5) -> list[MemoryEntry]:
        """
        Simple keyword-overlap similarity search.
        For production, replace with the vector store in memory/vector_store.py.
        """
        q_words = set(query.lower().split())
        scored: list[tuple[float, MemoryEntry]] = []

        for entry in self._episodic:
            e_words = set(entry.content.lower().split())
            overlap = len(q_words & e_words)
            if overlap > 0:
                score = overlap / (len(q_words) + 1)
                scored.append((score, entry))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [e for _, e in scored[:top_k]]

    # ─── Summarise ───────────────────────────────────────────────────────────

    def working_memory_as_text(self) -> str:
        """Format working memory as a concise text block for prompt injection."""
        entries = self.retrieve_working()
        if not entries:
            return "(no working memory)"
        lines = []
        for i, e in enumerate(entries, 1):
            lines.append(f"{i}. [{e.timestamp[:19]}] {e.content[:300]}")
        return "\n".join(lines)

    def episodic_summary(self, last_n: int = 5) -> str:
        """Compact summary of the last N episodic memories."""
        entries = self.retrieve_recent(last_n)
        if not entries:
            return "(no episodic memory)"
        return "\n".join(f"• {e.content[:200]}" for e in entries)

    # ─── Introspection ───────────────────────────────────────────────────────

    @property
    def entry_count(self) -> int:
        return len(self._episodic)

    def clear(self) -> None:
        self._episodic.clear()
        self._working.clear()
        self._log.info("Memory cleared")

    def to_dict(self) -> list[dict]:
        return [e.model_dump() for e in self._episodic]
