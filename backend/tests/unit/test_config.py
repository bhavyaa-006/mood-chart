import pytest

from app.core.config import Settings


def test_default_secret_is_rejected_outside_development() -> None:
	with pytest.raises(ValueError, match="SECRET_KEY must be configured"):
		Settings(app_env="production")