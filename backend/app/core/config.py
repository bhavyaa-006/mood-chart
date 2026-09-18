from __future__ import annotations

from functools import lru_cache

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
	app_name: str = "Mood Tracker API"
	app_env: str = "development"
	database_url: str = Field(default="sqlite:///./mood_tracker.db")
	secret_key: str = Field(
		default="development-only-change-me-use-a-real-secret-key",
		min_length=32,
	)
	cors_origins: str = "http://localhost:5173"
	access_token_expire_minutes: int = 15
	refresh_token_expire_days: int = 30
	password_reset_expire_minutes: int = 30
	ai_api_key: str | None = None
	ai_base_url: str | None = None
	ai_model: str = "gpt-4o-mini"
	ai_timeout_seconds: float = 10.0
	ai_max_tokens: int = 250
	ai_cooldown_seconds: int = 60

	@model_validator(mode="after")
	def validate_environment(self) -> Settings:
		env = self.app_env.lower()
		if env not in {"development", "test", "testing", "production"}:
			raise ValueError("APP_ENV must be one of: development, test, testing, production")
		if env == "production" and self.secret_key == "development-only-change-me-use-a-real-secret-key":
			raise ValueError("SECRET_KEY must be configured in production")
		if env == "production" and not self.database_url:
			raise ValueError("DATABASE_URL must be configured in production")
		return self

	model_config = SettingsConfigDict(
		env_file=".env",
		env_file_encoding="utf-8",
		extra="ignore",
		case_sensitive=False,
	)

	@property
	def cors_origin_list(self) -> list[str]:
		return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
	return Settings()
