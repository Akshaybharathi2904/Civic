"""
tools/web_search_tool.py
────────────────────────
Web search via DuckDuckGo Instant Answer API (no API key required).
Falls back to a structured mock if the network is unreachable.
"""

from __future__ import annotations

from typing import Any

import httpx

from config.settings import settings
from tools.base_tool import BaseTool
from utils.logger import get_logger

log = get_logger(__name__)

DDGO_URL = "https://api.duckduckgo.com/"


class WebSearchTool(BaseTool):
    """Search the web using DuckDuckGo and return a list of results."""

    @property
    def name(self) -> str:
        return "web_search"

    @property
    def description(self) -> str:
        return (
            "Search the internet for information on any topic. "
            "Returns a list of titles, URLs, and snippets."
        )

    @property
    def parameters_schema(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The search query string.",
                },
                "max_results": {
                    "type": "integer",
                    "description": "Maximum number of results to return (default 5).",
                    "default": 5,
                },
            },
            "required": ["query"],
        }

    async def _run(self, arguments: dict[str, Any]) -> Any:
        query: str = arguments["query"]
        max_results: int = arguments.get("max_results", settings.web_search_max_results)

        results: list[dict[str, str]] = []

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    DDGO_URL,
                    params={
                        "q": query,
                        "format": "json",
                        "no_html": "1",
                        "skip_disambig": "1",
                    },
                )
                resp.raise_for_status()
                data = resp.json()

            # Abstract / instant answer
            if data.get("AbstractText"):
                results.append({
                    "title": data.get("Heading", "Overview"),
                    "url": data.get("AbstractURL", ""),
                    "snippet": data["AbstractText"][:500],
                    "source": "DuckDuckGo Instant Answer",
                })

            # Related topics
            for topic in data.get("RelatedTopics", [])[:max_results]:
                if isinstance(topic, dict) and "Text" in topic:
                    results.append({
                        "title": topic.get("FirstURL", "").split("/")[-1].replace("_", " "),
                        "url": topic.get("FirstURL", ""),
                        "snippet": topic["Text"][:300],
                        "source": "DuckDuckGo Related",
                    })
                    if len(results) >= max_results:
                        break

        except Exception as e:
            log.warning(f"WebSearchTool HTTP error: {e}. Using fallback.")
            results = [
                {
                    "title": f"Search result for: {query}",
                    "url": f"https://duckduckgo.com/?q={query.replace(' ', '+')}",
                    "snippet": (
                        f"Could not retrieve live results for '{query}'. "
                        "Network may be unavailable. Please analyse with existing context."
                    ),
                    "source": "Fallback",
                }
            ]

        return {
            "query": query,
            "result_count": len(results),
            "results": results[:max_results],
        }
