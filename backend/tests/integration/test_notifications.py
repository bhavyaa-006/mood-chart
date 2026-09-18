from collections.abc import Generator

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base
from app.db.session import get_db
from app.main import app

engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def override_get_db() -> Generator[Session, None, None]:
	db = TestingSessionLocal()
	try:
		yield db
	finally:
		db.close()


client = TestClient(app)


def setup_module() -> None:
	app.dependency_overrides[get_db] = override_get_db
	Base.metadata.create_all(bind=engine)


def setup_function() -> None:
	Base.metadata.drop_all(bind=engine)
	Base.metadata.create_all(bind=engine)


def teardown_module() -> None:
	app.dependency_overrides.clear()
	Base.metadata.drop_all(bind=engine)


def authenticated_headers() -> dict[str, str]:
	registration = client.post(
		"/api/auth/register",
		json={"email": "notifications@example.com", "password": "Strong-password-123"},
	)
	token = client.post(
		"/api/auth/login",
		data={"username": "notifications@example.com", "password": "Strong-password-123"},
	).json()["access_token"]
	assert registration.status_code == 201
	return {"Authorization": f"Bearer {token}"}


def test_notification_preferences_default_and_patch() -> None:
	headers = authenticated_headers()
	default = client.get("/api/notifications/preferences", headers=headers)
	assert default.status_code == 200
	assert default.json()["enabled"] is False
	assert default.json()["reminder_time"] == "20:00:00"
	assert default.json()["timezone"] == "UTC"

	updated = client.patch(
		"/api/notifications/preferences",
		headers=headers,
		json={"enabled": True, "reminder_time": "08:30", "timezone": "America/Los_Angeles"},
	)
	assert updated.status_code == 200
	assert updated.json()["enabled"] is True
	assert updated.json()["reminder_time"] == "08:30:00"
	assert updated.json()["timezone"] == "America/Los_Angeles"


def test_notification_preferences_validate_timezone_and_time() -> None:
	headers = authenticated_headers()
	invalid_timezone = client.patch(
		"/api/notifications/preferences",
		headers=headers,
		json={"timezone": "Not/A_Timezone"},
	)
	assert invalid_timezone.status_code == 422

	invalid_time = client.patch(
		"/api/notifications/preferences",
		headers=headers,
		json={"reminder_time": "25:99"},
	)
	assert invalid_time.status_code == 422
