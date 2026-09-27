import pytest
from pydantic import ValidationError

from app.core.config import Settings


def test_required_database_settings_are_not_optional(monkeypatch: pytest.MonkeyPatch) -> None:
	for name in ("DATABASE_URL", "SECRET_KEY", "CORS_ORIGINS"):
		monkeypatch.delenv(name, raising=False)
	with pytest.raises(ValidationError):
		Settings(_env_file=None)


def test_non_psycopg_database_is_rejected() -> None:
	with pytest.raises(ValueError, match=r"postgresql\+psycopg driver"):
		Settings(
			secret_key="a" * 32,
			cors_origins="http://localhost:5173",
			database_url="sqlite:///./mood_tracker.db",
		)


def test_localhost_cors_is_rejected_in_production() -> None:
	with pytest.raises(ValueError, match="CORS_ORIGINS must be configured"):
		Settings(
			app_env="production",
			secret_key="a" * 32,
			database_url="postgresql+psycopg://user:password@db/moodtracker",
			cors_origins="http://localhost:5173",
		)