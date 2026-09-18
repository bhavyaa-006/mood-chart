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


def authenticated_headers(email: str = "mood@example.com") -> dict[str, str]:
	registration = client.post(
		"/api/auth/register",
		json={"email": email, "password": "Strong-password-123"},
	)
	token = client.post(
		"/api/auth/login",
		data={"username": email, "password": "Strong-password-123"},
	).json()["access_token"]
	assert registration.status_code == 201
	return {"Authorization": f"Bearer {token}"}


def test_mood_daily_uniqueness_and_user_scoped_crud() -> None:
	headers = authenticated_headers()
	payload = {"mood": 4, "stress_level": 2, "energy_level": 5, "entry_date": "2026-09-18", "notes": "Good day"}

	created = client.post("/api/moods", headers=headers, json=payload)
	assert created.status_code == 201
	assert created.json()["mood"] == 4

	duplicate = client.post("/api/moods", headers=headers, json=payload)
	assert duplicate.status_code == 409

	updated = client.patch(
		f"/api/moods/{created.json()['id']}",
		headers=headers,
		json={"stress_level": 3},
	)
	assert updated.status_code == 200
	assert updated.json()["stress_level"] == 3

	listed = client.get("/api/moods", headers=headers)
	assert listed.status_code == 200
	assert len(listed.json()) == 1

	deleted = client.delete(f"/api/moods/{created.json()['id']}", headers=headers)
	assert deleted.status_code == 204


def test_mood_validation_and_journal_crud() -> None:
	headers = authenticated_headers("journal@example.com")
	invalid = client.post(
		"/api/moods",
		headers=headers,
		json={"mood": 6, "stress_level": 1, "energy_level": 1, "entry_date": "2026-09-18"},
	)
	assert invalid.status_code == 422

	journal = client.post(
		"/api/journal",
		headers=headers,
		json={"content": "A short reflection", "entry_date": "2026-09-18"},
	)
	assert journal.status_code == 201

	listed = client.get("/api/journal", headers=headers)
	assert listed.status_code == 200
	assert listed.json()[0]["content"] == "A short reflection"

	updated = client.patch(
		f"/api/journal/{journal.json()['id']}",
		headers=headers,
		json={"content": "An updated reflection"},
	)
	assert updated.status_code == 200
	assert updated.json()["content"] == "An updated reflection"

	deleted = client.delete(f"/api/journal/{journal.json()['id']}", headers=headers)
	assert deleted.status_code == 204
