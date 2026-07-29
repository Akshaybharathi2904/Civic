"""
config/settings.py
──────────────────
Centralised settings loaded from environment variables (.env file).
All agent behaviour, model params, timeouts, and limits are
controlled from here — never scattered across files.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Pydantic-settings model.  Values are read (in order) from:
      1. Environment variables
      2. .env file (if present)
      3. Defaults defined below
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ─── LLM ────────────────────────────────────────────────────
    gemini_api_key: str = Field(
        default="",
        description="Google Gemini API key",
    )
    gemini_model: str = Field(
        default="gemini-2.5-flash",
        description="Gemini model name",
    )
    gemini_temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    gemini_max_tokens: int = Field(default=8192, ge=256)

    # ─── Agent behaviour ────────────────────────────────────────
    max_retries: int = Field(default=3, ge=1, le=10)
    retry_backoff_base: float = Field(default=2.0, ge=1.0)
    max_reflection_loops: int = Field(default=3, ge=1, le=10)
    agent_timeout_seconds: int = Field(default=120, ge=10)
    min_validation_score: float = Field(default=0.75, ge=0.0, le=1.0)
    max_orchestration_rounds: int = Field(default=20, ge=1)

    # ─── Memory ─────────────────────────────────────────────────
    memory_max_entries: int = Field(default=500, ge=10)
    shared_memory_max_entries: int = Field(default=1000, ge=10)
    memory_similarity_threshold: float = Field(default=0.3, ge=0.0, le=1.0)
    memory_top_k: int = Field(default=5, ge=1)

    # ─── Logging ────────────────────────────────────────────────
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"
    log_format: Literal["json", "pretty"] = "pretty"
    log_file: str = "logs/agentverse.log"

    # ─── Tools ──────────────────────────────────────────────────
    web_search_max_results: int = Field(default=5, ge=1, le=20)
    code_execution_timeout: int = Field(default=30, ge=5, le=120)
    file_base_dir: str = "./workspace"

    # ─── Derived paths ──────────────────────────────────────────
    @property
    def base_dir(self) -> Path:
        return Path(__file__).parent.parent

    @property
    def workspace_dir(self) -> Path:
        p = self.base_dir / self.file_base_dir
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def logs_dir(self) -> Path:
        p = self.base_dir / Path(self.log_file).parent
        p.mkdir(parents=True, exist_ok=True)
        return p

    @field_validator("gemini_api_key")
    @classmethod
    def warn_if_missing_key(cls, v: str) -> str:
        if not v:
            import warnings
            warnings.warn(
                "GEMINI_API_KEY is not set. LLM calls will fail. "
                "Copy .env.example → .env and set your key.",
                stacklevel=2,
            )
        return v


# Singleton instance — import this everywhere
settings = Settings()
