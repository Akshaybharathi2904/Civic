"""
prompts/agent_prompts.py
────────────────────────
Dynamic prompt builders for each agent's reasoning steps.
These functions compose context-aware prompts by injecting
the current WorkflowSession state, memory, and available tools.
"""

from __future__ import annotations

from typing import Any

from models.schemas import AgentMessage, WorkflowSession
from utils.helpers import flatten_context, safe_json_dumps, truncate


# ─── Orchestrator ────────────────────────────────────────────────────────────

def orchestrator_routing_prompt(
    session: WorkflowSession,
    available_agents: list[str],
    shared_memory_str: str,
) -> str:
    ctx = session.get_context_summary()
    agents_list = "\n".join(f"  - {a}" for a in available_agents)
    return f"""
# ORCHESTRATOR DECISION

## Current Session State
{flatten_context(ctx)}

## Shared Memory
{shared_memory_str}

## Available Agents
{agents_list}

## Your Task
Based on the current session state and what has already been accomplished,
decide which agent should act NEXT and what task it should perform.

You must respond with a JSON object in EXACTLY this format:
{{
  "reasoning": "step-by-step thinking about what needs to happen next",
  "next_agent": "one of the agent names above",
  "task": "specific task description for that agent",
  "priority": "low|medium|high|critical",
  "context": {{
    "key": "any additional context the agent needs"
  }},
  "should_terminate": false,
  "termination_reason": null
}}

If the workflow is complete and you have a high-quality final output, set:
  "should_terminate": true
  "termination_reason": "explanation of why the workflow is done"
""".strip()


def orchestrator_reflection_prompt(
    session: WorkflowSession,
    last_output: dict[str, Any],
    validation: dict[str, Any],
) -> str:
    return f"""
# ORCHESTRATOR REFLECTION

## Task
{session.initial_task}

## Last Agent Output (summary)
{safe_json_dumps(last_output)[:1000]}

## Validation Result
Score: {validation.get('score', 'N/A')}
Issues: {validation.get('issues', [])}
Should retry: {validation.get('should_retry', False)}

## Your Decision
Based on the validation, what action should be taken next?
Respond with JSON:
{{
  "reasoning": "...",
  "action": "retry|continue|escalate|terminate",
  "next_agent": "agent name if action is retry or continue",
  "task": "revised task if retrying",
  "context": {{}}
}}
""".strip()


# ─── Planner ─────────────────────────────────────────────────────────────────

def planner_create_plan_prompt(
    objective: str,
    context: dict[str, Any],
    available_agents: list[str],
    available_tools: str,
    memory_context: str,
) -> str:
    return f"""
# PLANNING REQUEST

## Objective
{objective}

## Current Context
{flatten_context(context)}

## Relevant Memory
{memory_context}

## Available Agents
{', '.join(available_agents)}

## Available Tools
{available_tools}

## Your Task
Create a comprehensive, step-by-step execution plan to achieve the objective.
Each step must be concrete and measurable.

Respond with JSON:
{{
  "title": "plan title",
  "objective": "restated objective",
  "analysis": "your understanding of the problem",
  "steps": [
    {{
      "step_id": "step_1",
      "title": "step title",
      "description": "what specifically needs to be done",
      "assigned_agent": "agent name",
      "dependencies": [],
      "tools_required": ["tool_name"],
      "expected_output": "what this step will produce"
    }}
  ],
  "risks": ["potential issues"],
  "success_criteria": ["how we know we're done"]
}}
""".strip()


def planner_replan_prompt(
    original_plan: dict[str, Any],
    failure_context: dict[str, Any],
    completed_steps: list[str],
) -> str:
    return f"""
# REPLANNING REQUEST

The original plan encountered an issue.

## Original Objective
{original_plan.get('objective', 'N/A')}

## Completed Steps So Far
{', '.join(completed_steps) or 'None'}

## Failure Context
{safe_json_dumps(failure_context)[:800]}

## Your Task
Create a revised plan that:
1. Builds on what was already completed
2. Addresses the failure
3. Reaches the original objective

Respond with the same JSON plan format as before.
""".strip()


# ─── Researcher ──────────────────────────────────────────────────────────────

def researcher_prompt(
    task: str,
    context: dict[str, Any],
    available_tools: str,
    memory_context: str,
) -> str:
    return f"""
# RESEARCH TASK

## Task
{task}

## Context
{flatten_context(context)}

## Relevant Memory
{memory_context}

## Available Tools
{available_tools}

## Instructions
1. Think: what information do I need? What are the key questions?
2. Plan: which tools will I use?
3. Execute: use tools to gather information
4. Synthesise: compile findings into a structured summary

For EACH tool you want to use, include it in your `tool_calls` list.

Respond with JSON:
{{
  "thinking": "what you need to find and why",
  "research_questions": ["Q1", "Q2"],
  "tool_calls": [
    {{"tool": "web_search", "arguments": {{"query": "..."}}}}
  ],
  "findings": {{
    "key_facts": [],
    "data_points": [],
    "sources": [],
    "gaps": [],
    "confidence": "high|medium|low"
  }},
  "summary": "concise paragraph of all findings"
}}
""".strip()


# ─── Decision ────────────────────────────────────────────────────────────────

def decision_prompt(
    task: str,
    research_findings: dict[str, Any],
    context: dict[str, Any],
    memory_context: str,
) -> str:
    return f"""
# DECISION TASK

## Task
{task}

## Research Findings
{safe_json_dumps(research_findings)[:2000]}

## Full Context
{flatten_context(context)}

## Relevant Memory
{memory_context}

## Instructions
Analyse the findings, evaluate options, and make a clear decision.
Document your reasoning rigorously.

Respond with JSON:
{{
  "thinking": "step-by-step reasoning",
  "options_considered": [
    {{
      "option": "description",
      "pros": [],
      "cons": [],
      "risk_level": "low|medium|high",
      "confidence": 0.0
    }}
  ],
  "selected_option": "the chosen option",
  "rationale": "why this option was chosen",
  "confidence": 0.0,
  "caveats": [],
  "requires_human_review": false
}}
""".strip()


# ─── Executor ────────────────────────────────────────────────────────────────

def executor_prompt(
    task: str,
    context: dict[str, Any],
    decision: dict[str, Any],
    available_tools: str,
    memory_context: str,
) -> str:
    return f"""
# EXECUTION TASK

## Task
{task}

## Decision to Implement
{safe_json_dumps(decision)[:1000]}

## Context
{flatten_context(context)}

## Available Tools
{available_tools}

## Relevant Memory
{memory_context}

## Instructions
Execute the task using the available tools.
For each tool call, include it in `tool_calls`.
Report exactly what was done and what output was produced.

Respond with JSON:
{{
  "thinking": "step-by-step execution plan",
  "tool_calls": [
    {{"tool": "tool_name", "arguments": {{}}}}
  ],
  "actions_taken": ["description of each action"],
  "output": {{}},
  "success": true,
  "errors_encountered": [],
  "recovery_actions": []
}}
""".strip()


# ─── Validator ───────────────────────────────────────────────────────────────

def validator_prompt(
    original_task: str,
    agent_output: dict[str, Any],
    context: dict[str, Any],
    validation_criteria: list[str] | None = None,
) -> str:
    criteria = "\n".join(f"  - {c}" for c in (validation_criteria or [
        "Completeness: Does it fully address the task?",
        "Accuracy: Are the claims supported by evidence?",
        "Quality: Is the output well-structured and clear?",
        "Actionability: Can the output be used immediately?",
    ]))
    return f"""
# VALIDATION TASK

## Original Task
{original_task}

## Agent Output to Validate
{safe_json_dumps(agent_output)[:2000]}

## Context
{flatten_context(context)}

## Validation Criteria
{criteria}

## Instructions
Critically evaluate the output against each criterion.
Assign an overall quality score from 0.0 to 1.0.
Be specific about what is missing or incorrect.

Respond with JSON:
{{
  "thinking": "your step-by-step evaluation",
  "criterion_scores": {{
    "completeness": 0.0,
    "accuracy": 0.0,
    "quality": 0.0,
    "actionability": 0.0
  }},
  "score": 0.0,
  "valid": true,
  "issues": ["specific issue 1", "specific issue 2"],
  "suggestions": ["specific improvement 1"],
  "should_retry": false,
  "retry_agent": null,
  "retry_instructions": null
}}
""".strip()


# ─── Reporter ────────────────────────────────────────────────────────────────

def reporter_prompt(
    session_summary: dict[str, Any],
    all_outputs: dict[str, Any],
    validation_result: dict[str, Any],
) -> str:
    return f"""
# REPORT GENERATION TASK

## Session Summary
{safe_json_dumps(session_summary)[:500]}

## All Agent Outputs
{safe_json_dumps(all_outputs)[:3000]}

## Validation Result
{safe_json_dumps(validation_result)[:500]}

## Instructions
Synthesise all outputs into a coherent, professional final report.
Do not repeat content verbatim — synthesise and structure it.
The report should be immediately useful to the user.

Respond with JSON:
{{
  "title": "report title",
  "executive_summary": "2-3 sentence overview",
  "findings": [
    "finding 1",
    "finding 2"
  ],
  "analysis": "detailed analysis paragraph",
  "recommendations": [
    "actionable recommendation 1",
    "actionable recommendation 2"
  ],
  "next_steps": ["step 1", "step 2"],
  "confidence_level": "high|medium|low",
  "caveats": [],
  "metadata": {{}}
}}
""".strip()


# ─── Memory ──────────────────────────────────────────────────────────────────

def memory_retrieve_prompt(
    query: str,
    agent_memories: str,
    shared_memory_str: str,
) -> str:
    return f"""
# MEMORY RETRIEVAL TASK

## Query
{query}

## Agent Memory (recent entries)
{agent_memories}

## Shared Memory
{shared_memory_str}

## Instructions
From the memory stores, extract the most relevant information
for the given query. Rank by relevance and importance.

Respond with JSON:
{{
  "query": "{query}",
  "relevant_memories": [
    {{"content": "...", "relevance": 0.0, "source": "agent|shared"}}
  ],
  "synthesised_context": "a concise paragraph of the most relevant context",
  "missing_context": ["what we don't know yet"]
}}
""".strip()


def memory_store_prompt(
    agent_name: str,
    content: str,
    session_context: dict[str, Any],
) -> str:
    return f"""
# MEMORY STORAGE DECISION

## Agent
{agent_name}

## Content to Evaluate
{truncate(content, 1000)}

## Session Context
{flatten_context(session_context)}

## Instructions
Decide whether this content is worth storing in long-term memory
and assign an importance score.

Respond with JSON:
{{
  "should_store": true,
  "importance": 0.0,
  "tags": ["tag1", "tag2"],
  "summary": "compressed version suitable for memory storage",
  "reasoning": "why this is/isn't worth remembering"
}}
""".strip()
