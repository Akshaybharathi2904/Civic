"""
workflows/task_graph.py
───────────────────────
Dynamic Directed Acyclic Graph (DAG) for task tracking.

The Planner creates a graph of PlanStep nodes with dependency edges.
The Orchestrator queries the graph to find which steps are ready
(i.e., all dependencies satisfied) and dispatches them dynamically.
"""

from __future__ import annotations

from typing import Any

from models.schemas import ExecutionPlan, PlanStep, TaskStatus, AgentName
from utils.helpers import utcnow
from utils.logger import get_logger

log = get_logger(__name__)


class TaskNode:
    """Wraps a PlanStep with graph adjacency information."""

    def __init__(self, step: PlanStep) -> None:
        self.step = step
        self.dependents: list[str] = []  # step_ids that depend ON this node

    @property
    def step_id(self) -> str:
        return self.step.step_id

    @property
    def status(self) -> TaskStatus:
        return self.step.status

    @property
    def is_ready(self) -> bool:
        return self.step.status == TaskStatus.PENDING


class TaskGraph:
    """
    Dynamic execution graph built from an ExecutionPlan.

    Features
    ────────
    • Find all immediately executable steps
    • Mark steps as started / completed / failed
    • Detect cycles (raises ValueError)
    • Topological ordering
    • Progress reporting
    """

    def __init__(self, plan: ExecutionPlan) -> None:
        self._plan = plan
        self._nodes: dict[str, TaskNode] = {}
        self._build()

    # ─── Build ───────────────────────────────────────────────────────────────

    def _build(self) -> None:
        # Create nodes
        for step in self._plan.steps:
            self._nodes[step.step_id] = TaskNode(step)

        # Set dependents
        for step in self._plan.steps:
            for dep_id in step.dependencies:
                if dep_id in self._nodes:
                    self._nodes[dep_id].dependents.append(step.step_id)
                else:
                    log.warning(
                        f"Step '{step.step_id}' depends on unknown step '{dep_id}'"
                    )

        self._detect_cycles()
        log.info(f"TaskGraph built: {len(self._nodes)} steps")

    def _detect_cycles(self) -> None:
        visited: set[str] = set()
        rec_stack: set[str] = set()

        def dfs(node_id: str) -> bool:
            visited.add(node_id)
            rec_stack.add(node_id)
            node = self._nodes[node_id]
            for dep in node.step.dependencies:
                if dep not in visited:
                    if dfs(dep):
                        return True
                elif dep in rec_stack:
                    return True
            rec_stack.discard(node_id)
            return False

        for nid in self._nodes:
            if nid not in visited:
                if dfs(nid):
                    raise ValueError(f"Cycle detected in task graph near step '{nid}'")

    # ─── Query ───────────────────────────────────────────────────────────────

    def ready_steps(self) -> list[PlanStep]:
        """Return steps that are PENDING and have all dependencies COMPLETED."""
        done_ids = {
            nid for nid, node in self._nodes.items()
            if node.status == TaskStatus.COMPLETED
        }
        return [
            node.step
            for node in self._nodes.values()
            if node.status == TaskStatus.PENDING
            and all(dep in done_ids for dep in node.step.dependencies)
        ]

    def in_progress_steps(self) -> list[PlanStep]:
        return [n.step for n in self._nodes.values() if n.status == TaskStatus.IN_PROGRESS]

    def failed_steps(self) -> list[PlanStep]:
        return [n.step for n in self._nodes.values() if n.status == TaskStatus.FAILED]

    def completed_steps(self) -> list[PlanStep]:
        return [n.step for n in self._nodes.values() if n.status == TaskStatus.COMPLETED]

    @property
    def is_complete(self) -> bool:
        return all(n.status == TaskStatus.COMPLETED for n in self._nodes.values())

    @property
    def is_failed(self) -> bool:
        """True if any step has failed with no pending/in-progress steps remaining."""
        has_failed = any(n.status == TaskStatus.FAILED for n in self._nodes.values())
        has_active = any(
            n.status in (TaskStatus.PENDING, TaskStatus.IN_PROGRESS)
            for n in self._nodes.values()
        )
        return has_failed and not has_active

    def progress_pct(self) -> float:
        if not self._nodes:
            return 100.0
        done = sum(1 for n in self._nodes.values() if n.status == TaskStatus.COMPLETED)
        return done / len(self._nodes) * 100

    # ─── Mutate ──────────────────────────────────────────────────────────────

    def mark_started(self, step_id: str) -> None:
        node = self._nodes.get(step_id)
        if node:
            node.step.mark_started()
            log.info(f"TaskGraph: step '{step_id}' started")

    def mark_completed(self, step_id: str, result: dict[str, Any]) -> None:
        node = self._nodes.get(step_id)
        if node:
            node.step.mark_done(result)
            log.info(f"TaskGraph: step '{step_id}' completed ✓")

    def mark_failed(self, step_id: str, error: str) -> None:
        node = self._nodes.get(step_id)
        if node:
            node.step.mark_failed(error)
            log.error(f"TaskGraph: step '{step_id}' failed ✗ — {error}")

    def reset_step(self, step_id: str) -> None:
        """Reset a failed step to PENDING for retry."""
        node = self._nodes.get(step_id)
        if node:
            node.step.status = TaskStatus.PENDING
            node.step.result = None
            log.info(f"TaskGraph: step '{step_id}' reset to PENDING")

    # ─── Reporting ───────────────────────────────────────────────────────────

    def summary(self) -> str:
        total = len(self._nodes)
        done = len(self.completed_steps())
        failed = len(self.failed_steps())
        active = len(self.in_progress_steps())
        ready = len(self.ready_steps())
        return (
            f"TaskGraph [{self._plan.title}]: "
            f"{done}/{total} done, {active} active, {ready} ready, {failed} failed "
            f"({self.progress_pct():.0f}%)"
        )

    def topological_order(self) -> list[str]:
        """Return step IDs in a valid topological execution order."""
        result: list[str] = []
        visited: set[str] = set()

        def visit(nid: str) -> None:
            if nid in visited:
                return
            visited.add(nid)
            for dep in self._nodes[nid].step.dependencies:
                if dep in self._nodes:
                    visit(dep)
            result.append(nid)

        for nid in self._nodes:
            visit(nid)
        return result
