"""
main.py
───────
AgentVerse — Real Autonomous Multi-Agent AI System
Entry point for running the full autonomous agent workflow.

Usage:
    python main.py "Research the impact of AI on healthcare"
    python main.py  (interactive mode — prompts for task)
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

console = Console()


async def main(task: str | None = None) -> None:
    """Bootstrap and run the autonomous multi-agent system."""

    # ── Print banner ─────────────────────────────────────────────────────────
    console.print(Panel.fit(
        "[bold magenta]AgentVerse[/bold magenta] — [bold cyan]Autonomous Multi-Agent AI[/bold cyan]\n"
        "[dim]Powered by Google Gemini 2.5 Flash[/dim]",
        border_style="magenta",
    ))

    # ── Get task ─────────────────────────────────────────────────────────────
    if task is None:
        if len(sys.argv) > 1:
            task = " ".join(sys.argv[1:])
        else:
            console.print("\n[bold yellow]Enter your task:[/bold yellow] ", end="")
            task = input().strip()

    if not task:
        console.print("[red]Error: No task provided.[/red]")
        sys.exit(1)

    console.print(f"\n[bold]Task:[/bold] {task}\n")

    # ── Import after banner (avoids slow import during --help) ───────────────
    from config.settings import settings
    from memory.shared_memory import SharedMemory
    from memory.vector_store import VectorStore
    from tools.tool_registry import bootstrap_registry
    from workflows.message_bus import MessageBus
    from agents.orchestrator import OrchestratorAgent

    # ── Validate API key ─────────────────────────────────────────────────────
    if not settings.gemini_api_key:
        console.print(
            "[bold red]ERROR:[/bold red] GEMINI_API_KEY is not set.\n"
            "Copy [cyan].env.example[/cyan] → [cyan].env[/cyan] and add your API key.\n"
            "Get one at: https://aistudio.google.com/app/apikey"
        )
        sys.exit(1)

    # ── Bootstrap infrastructure ──────────────────────────────────────────────
    console.print("[dim]Bootstrapping tools, memory, and message bus...[/dim]")

    registry = bootstrap_registry()
    shared_mem = SharedMemory(max_entries=settings.shared_memory_max_entries)
    vector_store = VectorStore()
    bus = MessageBus()

    console.print(
        f"[green]✓[/green] {len(registry)} tools registered: "
        f"{', '.join(registry.tool_names())}"
    )

    # ── Create Orchestrator ───────────────────────────────────────────────────
    orchestrator = OrchestratorAgent(
        bus=bus,
        registry=registry,
        shared_memory=shared_mem,
        vector_store=vector_store,
    )

    console.print("[green]✓[/green] All agents initialised\n")
    console.rule("[bold magenta]Workflow Starting[/bold magenta]")

    # ── Run workflow ──────────────────────────────────────────────────────────
    try:
        session = await orchestrator.run(task)
    except KeyboardInterrupt:
        console.print("\n[yellow]Workflow interrupted by user.[/yellow]")
        sys.exit(0)
    except Exception as e:
        console.print(f"\n[bold red]Workflow failed:[/bold red] {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    # ── Print results ─────────────────────────────────────────────────────────
    console.rule("[bold cyan]Workflow Complete[/bold cyan]")

    # Summary table
    table = Table(show_header=True, header_style="bold magenta", box=None)
    table.add_column("Metric", style="cyan")
    table.add_column("Value", style="white")

    table.add_row("Session ID", session.session_id[:16] + "...")
    table.add_row("Rounds", str(session.round))
    table.add_row("Messages", str(len(session.messages)))
    table.add_row("Tool Calls", str(len(session.tool_calls)))
    table.add_row("Agents Activated", str(len(session.agent_outputs)))
    table.add_row("Status", f"[green]{session.status.value}[/green]")

    console.print(table)

    # Final report
    report_output = session.get_agent_output_by_name("ReporterAgent")
    if report_output:
        console.print(
            Panel(
                f"[bold]{report_output.get('title', 'Report')}[/bold]\n\n"
                + report_output.get("summary", ""),
                title="[bold cyan]Executive Summary[/bold cyan]",
                border_style="cyan",
            )
        )

        findings = report_output.get("findings", [])
        if findings:
            console.print("\n[bold yellow]Key Findings:[/bold yellow]")
            for i, f in enumerate(findings[:5], 1):
                console.print(f"  {i}. {f}")

        recs = report_output.get("recommendations", [])
        if recs:
            console.print("\n[bold green]Recommendations:[/bold green]")
            for i, r in enumerate(recs[:5], 1):
                console.print(f"  {i}. {r}")

        if report_output.get("report_file"):
            console.print(
                f"\n[dim]Full report saved to: "
                f"{settings.workspace_dir / report_output['report_file']}[/dim]"
            )

    # Validation score
    if session.validation_results:
        last_validation = session.validation_results[-1]
        score = last_validation.score
        color = "green" if score >= 0.75 else "yellow" if score >= 0.5 else "red"
        console.print(
            f"\n[bold]Quality Score:[/bold] [{color}]{score:.0%}[/{color}]"
        )

    console.print("\n[bold magenta]AgentVerse run complete. ✓[/bold magenta]\n")


# ── Patch WorkflowSession to support name-based lookup ───────────────────────
from models.schemas import WorkflowSession as _WS

def _get_output_by_name(self, name: str):
    return self.agent_outputs.get(name)

_WS.get_agent_output_by_name = _get_output_by_name  # type: ignore


if __name__ == "__main__":
    asyncio.run(main())
