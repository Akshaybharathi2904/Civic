"""
models/schemas.py
─────────────────
Pydantic v2 data models for the entire agent system.
These are the typed contracts that flow between every component.
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Literal

from pydantic import BaseModel, Field, model_validator

from utils.helpers import new_id, utcnow


# ─── Enums ──────────────────────────────────────────────────────────────────

class AgentName(str, Enum):
    ORCHESTRATOR = "OrchestratorAgent"
    PLANNER = "PlannerAgent"
    RESEARCHER = "ResearchAgent"
    DECISION = "DecisionAgent"
    EXECUTOR = "ExecutorAgent"
    VALIDATOR = "ValidatorAgent"
    REPORTER = "ReporterAgent"
    MEMORY = "MemoryAgent"
    SYSTEM = "System"


class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    DELEGATED = "delegated"
    NEEDS_REVISION = "needs_revision"


class MessageType(str, Enum):
    TASK = "task"
    RESULT = "result"
    DELEGATION = "delegation"
    QUERY = "query"
    RESPONSE = "response"
    ERROR = "error"
    REFLECTION = "reflection"
    BROADCAST = "broadcast"


# ─── Core message protocol ──────────────────────────────────────────────────

class AgentMessage(BaseModel):
    """
    The canonical inter-agent message.  Every piece of information
    flowing between agents is wrapped in this envelope.
    """

    id: str = Field(default_factory=new_id)
    from_agent: AgentName
    to_agent: AgentName | Literal["ALL"]
    type: MessageType = MessageType.TASK
    task: str
    priority: Priority = Priority.MEDIUM
    context: dict[str, Any] = Field(default_factory=dict)
    payload: dict[str, Any] = Field(default_factory=dict)
    metadata: dict[str, Any] = Field(default_factory=dict)
    timestamp: str = Field(default_factory=utcnow)
    parent_id: str | None = None       # ID of the message this is a reply to
    session_id: str | None = None
    round: int = 0                     # Orchestration round number

    def reply(
        self,
        *,
        from_agent: AgentName,
        task: str,
        type: MessageType = MessageType.RESULT,
        payload: dict[str, Any] | None = None,
        **kwargs: Any,
    ) -> "AgentMessage":
        """Convenience: build a reply that keeps session/parent linkage."""
        return AgentMessage(
            from_agent=from_agent,
            to_agent=self.from_agent,
            type=type,
            task=task,
            priority=self.priority,
            context=dict(self.context),
            payload=payload or {},
            session_id=self.session_id,
            parent_id=self.id,
            round=self.round,
            **kwargs,
        )

    def to_prompt_str(self) -> str:
        """Human-readable representation for inclusion in prompts."""
        return (
            f"[Message from={self.from_agent.value} to={self.to_agent} "
            f"type={self.type.value} priority={self.priority.value}]\n"
            f"Task: {self.task}\n"
            f"Context: {self.context}"
        )


# ─── Planning ────────────────────────────────────────────────────────────────

class PlanStep(BaseModel):
    step_id: str = Field(default_factory=new_id)
    title: str
    description: str
    assigned_agent: AgentName
    dependencies: list[str] = Field(default_factory=list)   # step_ids
    tools_required: list[str] = Field(default_factory=list)
    expected_output: str = ""
    status: TaskStatus = TaskStatus.PENDING
    result: dict[str, Any] | None = None
    started_at: str | None = None
    completed_at: str | None = None

    def mark_started(self) -> None:
        self.status = TaskStatus.IN_PROGRESS
        self.started_at = utcnow()

    def mark_done(self, result: dict[str, Any]) -> None:
        self.status = TaskStatus.COMPLETED
        self.result = result
        self.completed_at = utcnow()

    def mark_failed(self, error: str) -> None:
        self.status = TaskStatus.FAILED
        self.result = {"error": error}
        self.completed_at = utcnow()


class ExecutionPlan(BaseModel):
    plan_id: str = Field(default_factory=new_id)
    title: str
    objective: str
    steps: list[PlanStep] = Field(default_factory=list)
    created_at: str = Field(default_factory=utcnow)
    status: TaskStatus = TaskStatus.PENDING
    session_id: str | None = None

    @property
    def completed_steps(self) -> list[PlanStep]:
        return [s for s in self.steps if s.status == TaskStatus.COMPLETED]

    @property
    def pending_steps(self) -> list[PlanStep]:
        return [s for s in self.steps if s.status == TaskStatus.PENDING]

    @property
    def ready_steps(self) -> list[PlanStep]:
        """Steps whose dependencies are all completed."""
        done_ids = {s.step_id for s in self.completed_steps}
        return [
            s for s in self.pending_steps
            if all(dep in done_ids for dep in s.dependencies)
        ]

    def progress_pct(self) -> float:
        if not self.steps:
            return 0.0
        return len(self.completed_steps) / len(self.steps) * 100


# ─── Memory ──────────────────────────────────────────────────────────────────

class MemoryEntry(BaseModel):
    entry_id: str = Field(default_factory=new_id)
    agent_name: AgentName
    content: str
    metadata: dict[str, Any] = Field(default_factory=dict)
    importance: float = Field(default=0.5, ge=0.0, le=1.0)
    timestamp: str = Field(default_factory=utcnow)
    session_id: str | None = None
    tags: list[str] = Field(default_factory=list)


# ─── Tool calls ──────────────────────────────────────────────────────────────

class ToolCall(BaseModel):
    tool_name: str
    arguments: dict[str, Any] = Field(default_factory=dict)
    call_id: str = Field(default_factory=new_id)
    timestamp: str = Field(default_factory=utcnow)


class ToolResult(BaseModel):
    call_id: str
    tool_name: str
    success: bool
    output: Any
    error: str | None = None
    duration_ms: int = 0
    timestamp: str = Field(default_factory=utcnow)


# ─── Reasoning / Reflection ──────────────────────────────────────────────────

class ReasoningStep(BaseModel):
    step_id: str = Field(default_factory=new_id)
    agent_name: AgentName
    thought: str
    action: str | None = None
    observation: str | None = None
    timestamp: str = Field(default_factory=utcnow)


class ValidationResult(BaseModel):
    valid: bool
    score: float = Field(ge=0.0, le=1.0)
    issues: list[str] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)
    reasoning: str = ""
    should_retry: bool = False
    retry_agent: AgentName | None = None


# ─── Final report ────────────────────────────────────────────────────────────

class AgentReport(BaseModel):
    report_id: str = Field(default_factory=new_id)
    session_id: str
    title: str
    summary: str
    findings: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    plan: ExecutionPlan | None = None
    tool_calls: list[ToolCall] = Field(default_factory=list)
    reasoning_chain: list[ReasoningStep] = Field(default_factory=list)
    validation: ValidationResult | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: str = Field(default_factory=utcnow)


# ─── Session / Workflow context ──────────────────────────────────────────────

class WorkflowSession(BaseModel):
    """
    The global shared state for one complete orchestration run.
    The orchestrator and all agents read/write this object.
    """

    session_id: str = Field(default_factory=new_id)
    initial_task: str
    status: TaskStatus = TaskStatus.PENDING
    plan: ExecutionPlan | None = None
    messages: list[AgentMessage] = Field(default_factory=list)
    reasoning_chain: list[ReasoningStep] = Field(default_factory=list)
    tool_calls: list[ToolCall] = Field(default_factory=list)
    tool_results: list[ToolResult] = Field(default_factory=list)
    agent_outputs: dict[str, Any] = Field(default_factory=dict)
    validation_results: list[ValidationResult] = Field(default_factory=list)
    final_report: AgentReport | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: str = Field(default_factory=utcnow)
    completed_at: str | None = None
    round: int = 0

    def add_message(self, msg: AgentMessage) -> None:
        self.messages.append(msg)

    def add_reasoning(self, step: ReasoningStep) -> None:
        self.reasoning_chain.append(step)

    def set_agent_output(self, agent: AgentName, output: Any) -> None:
        self.agent_outputs[agent.value] = output

    def get_agent_output(self, agent: AgentName) -> Any:
        return self.agent_outputs.get(agent.value)

    def get_context_summary(self) -> dict[str, Any]:
        """Compact summary for prompt injection."""
        return {
            "session_id": self.session_id,
            "task": self.initial_task,
            "round": self.round,
            "plan_progress": f"{self.plan.progress_pct():.0f}%" if self.plan else "N/A",
            "agents_activated": list(self.agent_outputs.keys()),
            "message_count": len(self.messages),
            "tool_calls_count": len(self.tool_calls),
        }
