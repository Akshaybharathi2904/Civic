"""
workflows/message_bus.py
────────────────────────
Async pub/sub message bus for inter-agent communication.

Design
──────
• Each agent subscribes to its own "inbox" topic.
• The Orchestrator subscribes to a special "orchestrator" topic.
• Broadcast messages are delivered to ALL subscribers.
• Messages are queued; agents `await bus.receive(my_name)` to get them.
• History of all messages is maintained for inspection.
"""

from __future__ import annotations

import asyncio
from collections import defaultdict
from typing import Any

from models.schemas import AgentMessage, AgentName, MessageType
from utils.helpers import new_id, utcnow
from utils.logger import get_logger

log = get_logger(__name__)


class MessageBus:
    """
    Async publish/subscribe message bus.

    Usage::

        bus = MessageBus()

        # Publisher (any agent):
        await bus.publish(message)

        # Subscriber (agent's main loop):
        msg = await bus.receive(AgentName.RESEARCHER, timeout=5.0)
    """

    def __init__(self) -> None:
        # Per-agent asyncio.Queue instances
        self._queues: dict[str, asyncio.Queue[AgentMessage]] = defaultdict(asyncio.Queue)
        # Full chronological log of every message
        self._history: list[AgentMessage] = []
        self._lock = asyncio.Lock()

    # ─── Publish ─────────────────────────────────────────────────────────────

    async def publish(self, message: AgentMessage) -> None:
        """
        Deliver a message to its target agent (or ALL agents if broadcast).
        """
        async with self._lock:
            self._history.append(message)

        if message.to_agent == "ALL":
            # Broadcast to every known queue
            async with self._lock:
                targets = list(self._queues.keys())
            for target in targets:
                await self._queues[target].put(message)
            log.debug(
                f"[Bus] BROADCAST from {message.from_agent.value} "
                f"→ {len(targets)} agents | '{message.task[:60]}'"
            )
        else:
            target_key = message.to_agent.value if isinstance(message.to_agent, AgentName) else message.to_agent
            await self._queues[target_key].put(message)
            log.debug(
                f"[Bus] {message.from_agent.value} → {target_key} "
                f"[{message.type.value}] '{message.task[:60]}'"
            )

    # ─── Subscribe / Receive ─────────────────────────────────────────────────

    async def receive(
        self,
        agent: AgentName,
        *,
        timeout: float | None = None,
    ) -> AgentMessage | None:
        """
        Dequeue the next message for *agent*.
        Returns None if *timeout* expires with no message.
        """
        queue = self._queues[agent.value]
        try:
            if timeout:
                return await asyncio.wait_for(queue.get(), timeout=timeout)
            return await queue.get()
        except asyncio.TimeoutError:
            return None

    def peek(self, agent: AgentName) -> int:
        """Return the number of queued messages for *agent*."""
        return self._queues[agent.value].qsize()

    # ─── History ─────────────────────────────────────────────────────────────

    def history(self) -> list[AgentMessage]:
        return list(self._history)

    def history_for(self, agent: AgentName) -> list[AgentMessage]:
        """Return messages TO or FROM the given agent."""
        name = agent.value
        return [
            m for m in self._history
            if m.from_agent.value == name or (
                m.to_agent == "ALL" or
                (isinstance(m.to_agent, AgentName) and m.to_agent.value == name)
            )
        ]

    def to_transcript(self) -> str:
        """Format all messages as a readable transcript."""
        lines = []
        for m in self._history:
            to = m.to_agent.value if isinstance(m.to_agent, AgentName) else m.to_agent
            lines.append(
                f"[{m.timestamp[:19]}] {m.from_agent.value} → {to} "
                f"[{m.type.value}]: {m.task[:100]}"
            )
        return "\n".join(lines)

    def clear(self) -> None:
        self._history.clear()
        self._queues.clear()


# ─── Module-level singleton ──────────────────────────────────────────────────
bus = MessageBus()
