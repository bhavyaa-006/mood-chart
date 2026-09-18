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
		json={"email": "activities@example.com", "password": "Strong-password-123"},
	)
	token = client.post(
		"/api/auth/login",
		data={"username": "activities@example.com", "password": "Strong-password-123"},
	).json()["access_token"]
	assert registration.status_code == 201
	return {"Authorization": f"Bearer {token}"}


def test_seeded_activities_and_session_completion() -> None:
	headers = authenticated_headers()
	activities = client.get("/api/activities", headers=headers)
	assert activities.status_code == 200
	assert len(activities.json()) == 8

	activity = activities.json()[0]
	session = client.post(
		f"/api/activities/{activity['id']}/sessions",
		headers=headers,
		json={"score": 72, "metadata": {"rounds": 3}},
	)
	assert session.status_code == 201
	assert session.json()["completed_at"] is None

	completed = client.post(
		f"/api/activities/sessions/{session.json()['id']}/complete",
		headers=headers,
		json={"score": 85, "metadata": {"rounds": 4}},
	)
	assert completed.status_code == 200
	assert completed.json()["score"] == 85
	assert completed.json()["completed_at"] is not None

	repeated = client.post(
		f"/api/activities/sessions/{session.json()['id']}/complete",
		headers=headers,
		json={"score": 90},
	)
	assert repeated.status_code == 200
	assert repeated.json()["score"] == 85

	history = client.get("/api/activities/sessions", headers=headers)
	assert history.status_code == 200
	assert len(history.json()) == 1


def test_activity_validation_and_missing_resources() -> None:
	headers = authenticated_headers()
	invalid = client.post(
		"/api/activities/not-an-id/sessions",
		headers=headers,
		json={},
	)
	assert invalid.status_code == 404

	missing_session = client.post(
		"/api/activities/sessions/not-a-session/complete",
		headers=headers,
		json={},
	)
	assert missing_session.status_code == 404
