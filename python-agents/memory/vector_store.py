"""
memory/vector_store.py
──────────────────────
Lightweight TF-IDF vector store for semantic memory retrieval.
Provides cosine-similarity search over stored text memories
without requiring any external vector DB.

For production scale, swap in FAISS or Chroma here.
"""

from __future__ import annotations

import math
from collections import Counter, defaultdict
from typing import Any

from models.schemas import MemoryEntry
from utils.logger import get_logger

log = get_logger(__name__)


def _tokenise(text: str) -> list[str]:
    """Lower-case, split on whitespace/punctuation."""
    import re
    return re.findall(r"[a-z0-9]+", text.lower())


class VectorStore:
    """
    TF-IDF document store with cosine-similarity search.
    Documents are MemoryEntry objects.
    """

    def __init__(self) -> None:
        self._entries: list[MemoryEntry] = []
        self._tf: list[dict[str, float]] = []        # TF per document
        self._df: Counter[str] = Counter()            # DF across all docs
        self._idf: dict[str, float] = {}             # Cached IDF
        self._dirty = True                            # Rebuild IDF on next query

    # ─── Indexing ─────────────────────────────────────────────────────────────

    def add(self, entry: MemoryEntry) -> None:
        tokens = _tokenise(entry.content)
        if not tokens:
            return

        # Term frequency (normalised)
        counts = Counter(tokens)
        total = sum(counts.values())
        tf = {term: count / total for term, count in counts.items()}

        # Update document frequency
        for term in set(tokens):
            self._df[term] += 1

        self._entries.append(entry)
        self._tf.append(tf)
        self._dirty = True
        log.debug(f"VectorStore: added entry {entry.entry_id[:8]} ({len(tokens)} tokens)")

    def add_many(self, entries: list[MemoryEntry]) -> None:
        for e in entries:
            self.add(e)

    # ─── IDF rebuild ─────────────────────────────────────────────────────────

    def _rebuild_idf(self) -> None:
        n = len(self._entries)
        if n == 0:
            self._idf = {}
            return
        self._idf = {
            term: math.log((n + 1) / (df + 1)) + 1.0
            for term, df in self._df.items()
        }
        self._dirty = False

    def _tfidf_vec(self, tf: dict[str, float]) -> dict[str, float]:
        return {term: tf_val * self._idf.get(term, 0.0) for term, tf_val in tf.items()}

    def _cosine(self, vec_a: dict[str, float], vec_b: dict[str, float]) -> float:
        common = set(vec_a) & set(vec_b)
        if not common:
            return 0.0
        dot = sum(vec_a[t] * vec_b[t] for t in common)
        mag_a = math.sqrt(sum(v * v for v in vec_a.values()))
        mag_b = math.sqrt(sum(v * v for v in vec_b.values()))
        if mag_a == 0 or mag_b == 0:
            return 0.0
        return dot / (mag_a * mag_b)

    # ─── Search ──────────────────────────────────────────────────────────────

    def search(
        self,
        query: str,
        *,
        top_k: int = 5,
        min_score: float = 0.05,
        filter_agent: str | None = None,
    ) -> list[tuple[float, MemoryEntry]]:
        """
        Return (score, entry) pairs sorted by cosine similarity descending.

        Args:
            query:        The query string.
            top_k:        Maximum number of results.
            min_score:    Minimum similarity threshold.
            filter_agent: If set, only return entries from this agent.
        """
        if self._dirty:
            self._rebuild_idf()

        q_tokens = _tokenise(query)
        if not q_tokens:
            return []

        q_counts = Counter(q_tokens)
        q_total = sum(q_counts.values())
        q_tf = {t: c / q_total for t, c in q_counts.items()}
        q_vec = self._tfidf_vec(q_tf)

        results: list[tuple[float, MemoryEntry]] = []
        for entry, doc_tf in zip(self._entries, self._tf):
            if filter_agent and entry.agent_name.value != filter_agent:
                continue
            doc_vec = self._tfidf_vec(doc_tf)
            score = self._cosine(q_vec, doc_vec)
            if score >= min_score:
                results.append((score, entry))

        results.sort(key=lambda x: x[0], reverse=True)
        return results[:top_k]

    # ─── Utils ───────────────────────────────────────────────────────────────

    def __len__(self) -> int:
        return len(self._entries)

    def clear(self) -> None:
        self._entries.clear()
        self._tf.clear()
        self._df.clear()
        self._idf.clear()
        self._dirty = True


# ─── Module-level singleton ──────────────────────────────────────────────────
vector_store = VectorStore()
