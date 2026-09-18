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
		json={"email": "game@example.com", "password": "Strong-password-123"},
	)
	token = client.post(
		"/api/auth/login",
		data={"username": "game@example.com", "password": "Strong-password-123"},
	).json()["access_token"]
	assert registration.status_code == 201
	return {"Authorization": f"Bearer {token}"}


def log_mood(headers: dict[str, str], entry_date: str) -> None:
	response = client.post(
		"/api/moods",
		headers=headers,
		json={"mood": 4, "stress_level": 2, "energy_level": 4, "entry_date": entry_date},
	)
	assert response.status_code == 201


def test_streaks_points_and_milestones_are_deterministic() -> None:
	headers = authenticated_headers()
	for entry_date in ("2026-09-14", "2026-09-15", "2026-09-16", "2026-09-18"):
		log_mood(headers, entry_date)

	streak = client.get("/api/streaks", headers=headers)
	assert streak.status_code == 200
	assert streak.json()["current_streak"] == 1
	assert streak.json()["longest_streak"] == 3
	assert streak.json()["total_logs"] == 4
	assert streak.json()["xp"] == 40

	achievements = client.get("/api/achievements", headers=headers)
	assert achievements.status_code == 200
	assert {item["name"] for item in achievements.json()} == {
		"First Check-In",
		"Three-Day Rhythm",
		"Week of Reflection",
	}

	unlocked = client.get("/api/achievements/unlocked", headers=headers)
	assert unlocked.status_code == 200
	assert [item["name"] for item in unlocked.json()] == ["First Check-In", "Three-Day Rhythm"]


def test_empty_streak_state_does_not_punish_users() -> None:
	headers = authenticated_headers()
	response = client.get("/api/streaks", headers=headers)

	assert response.status_code == 200
	assert response.json() == {
		"current_streak": 0,
		"longest_streak": 0,
		"last_activity_date": None,
		"total_logs": 0,
		"xp": 0,
	}
