"""
models/llm_client.py
────────────────────
Async Gemini client with:
  - Retry + exponential backoff
  - Structured JSON extraction
  - Chat history management
  - Token usage tracking
  - Streaming support
"""

from __future__ import annotations

import asyncio
import time
from typing import Any, AsyncIterator

import google.generativeai as genai
from google.generativeai.types import GenerationConfig

from config.settings import settings
from utils.helpers import async_retry, extract_json
from utils.logger import get_logger

log = get_logger(__name__)

# Configure Gemini once at import time
genai.configure(api_key=settings.gemini_api_key)


class LLMClient:
    """
    Thread-safe async wrapper around the Gemini generative model.
    One instance per agent — each maintains its own chat history.
    """

    def __init__(
        self,
        *,
        agent_name: str = "LLMClient",
        system_instruction: str | None = None,
        temperature: float | None = None,
        max_output_tokens: int | None = None,
    ) -> None:
        self._agent_name = agent_name
        self._log = log.bind(agent_name=agent_name)

        generation_config = GenerationConfig(
            temperature=temperature or settings.gemini_temperature,
            max_output_tokens=max_output_tokens or settings.gemini_max_tokens,
            candidate_count=1,
        )

        self._model = genai.GenerativeModel(
            model_name=settings.gemini_model,
            generation_config=generation_config,
            system_instruction=system_instruction,
        )

        # Conversation history: list of {"role": ..., "parts": [...]}
        self._history: list[dict[str, Any]] = []
        self._total_tokens = 0
        self._call_count = 0

    # ─── Core generate ───────────────────────────────────────────────────────

    @async_retry(max_attempts=None, exceptions=(Exception,))
    async def generate(
        self,
        prompt: str,
        *,
        keep_history: bool = False,
        extra_context: dict[str, Any] | None = None,
    ) -> str:
        """
        Send a prompt and return the text response.

        Args:
            prompt:        The user turn text.
            keep_history:  If True, append to this instance's chat history.
            extra_context: Additional key-value pairs prepended to the prompt.
        """
        if extra_context:
            context_str = "\n".join(f"[{k}]: {v}" for k, v in extra_context.items())
            full_prompt = f"{context_str}\n\n{prompt}"
        else:
            full_prompt = prompt

        start = time.monotonic()

        if keep_history:
            # Start / continue a stateful chat session
            chat = self._model.start_chat(history=self._history)
            response = await asyncio.to_thread(chat.send_message, full_prompt)
            self._history = chat.history  # type: ignore[attr-defined]
        else:
            response = await asyncio.to_thread(
                self._model.generate_content, full_prompt
            )

        elapsed_ms = int((time.monotonic() - start) * 1000)
        self._call_count += 1

        text = response.text if response.text else ""
        self._log.debug(
            f"LLM call #{self._call_count} ({elapsed_ms}ms) "
            f"| chars_in={len(full_prompt)} chars_out={len(text)}"
        )
        return text

    # ─── Structured JSON ────────────────────────────────────────────────────

    async def generate_json(
        self,
        prompt: str,
        *,
        schema_hint: str = "",
        keep_history: bool = False,
        max_attempts: int = 3,
    ) -> dict | list | None:
        """
        Like generate() but parses the response as JSON.
        Retries up to *max_attempts* times if parsing fails.
        """
        schema_suffix = (
            f"\n\nYou MUST respond with valid JSON only. No markdown, no prose.\n"
            f"Expected schema: {schema_hint}"
            if schema_hint
            else "\n\nYou MUST respond with valid JSON only. No additional text."
        )

        for attempt in range(1, max_attempts + 1):
            text = await self.generate(
                prompt + schema_suffix,
                keep_history=keep_history,
            )
            parsed = extract_json(text)
            if parsed is not None:
                return parsed

            self._log.warning(
                f"JSON parse failed (attempt {attempt}/{max_attempts}). "
                f"Raw: {text[:300]}"
            )
            if attempt < max_attempts:
                schema_suffix = (
                    "\n\nPrevious response was not valid JSON. "
                    "Return ONLY a JSON object/array — no prose, no fences."
                )

        self._log.error("All JSON parse attempts exhausted.")
        return None

    # ─── Streaming ──────────────────────────────────────────────────────────

    async def stream(self, prompt: str) -> AsyncIterator[str]:
        """
        Yield text chunks as they arrive from the model.
        Useful for real-time UIs / progress display.
        """
        response = await asyncio.to_thread(
            self._model.generate_content,
            prompt,
            stream=True,
        )
        for chunk in response:
            if chunk.text:
                yield chunk.text

    # ─── History management ──────────────────────────────────────────────────

    def reset_history(self) -> None:
        """Clear conversation history (start a fresh session)."""
        self._history = []

    def get_history(self) -> list[dict[str, Any]]:
        """Return a copy of the conversation history."""
        return list(self._history)

    def inject_history(self, history: list[dict[str, Any]]) -> None:
        """Restore conversation history (e.g., from MemoryAgent)."""
        self._history = list(history)

    @property
    def call_count(self) -> int:
        return self._call_count


def make_llm(agent_name: str, system_instruction: str) -> LLMClient:
    """Factory shorthand used by every agent."""
    return LLMClient(
        agent_name=agent_name,
        system_instruction=system_instruction,
        temperature=settings.gemini_temperature,
        max_output_tokens=settings.gemini_max_tokens,
    )
