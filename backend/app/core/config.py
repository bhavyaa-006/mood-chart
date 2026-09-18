from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
	app_name: str = "Mood Tracker API"
	app_env: str = "development"
	database_url: str = "sqlite:///./mood_tracker.db"
	secret_key: str = Field(
		default="development-only-change-me-use-a-real-secret-key",
		min_length=32,
	)
	cors_origins: str = "http://localhost:5173"
	access_token_expire_minutes: int = 15
	refresh_token_expire_days: int = 30
	password_reset_expire_minutes: int = 30

	model_config = SettingsConfigDict(
		env_file=".env",
		env_file_encoding="utf-8",
		extra="ignore",
	)

	@property
	def cors_origin_list(self) -> list[str]:
		return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
	return Settings()
