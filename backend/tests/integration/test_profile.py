from collections.abc import Generator

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base
from app.db.session import get_db
from app.main import app

engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
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
        json={"email": "profile@example.com", "password": "Strong-password-123"},
    )
    token = client.post(
        "/api/auth/login",
        data={"username": "profile@example.com", "password": "Strong-password-123"},
    ).json()["access_token"]
    assert registration.status_code == 201
    return {"Authorization": f"Bearer {token}"}


def test_onboarding_creates_profile_and_selected_goals() -> None:
    headers = authenticated_headers()

    response = client.post(
        "/api/profile/onboarding",
        headers=headers,
        json={
            "display_name": "Calm Explorer",
            "timezone": "America/New_York",
            "goals": ["stress_management", "mindfulness"],
        },
    )

    assert response.status_code == 200
    profile = response.json()
    assert profile["display_name"] == "Calm Explorer"
    assert profile["timezone"] == "America/New_York"
    assert profile["onboarding_completed"] is True
    assert {goal["category"] for goal in profile["goals"]} == {"stress_management", "mindfulness"}

    fetched = client.get("/api/profile", headers=headers)
    assert fetched.status_code == 200
    assert fetched.json() == profile


def test_goal_management_is_user_scoped_and_duplicate_safe() -> None:
    headers = authenticated_headers()

    created = client.post(
        "/api/profile/goals",
        headers=headers,
        json={"category": "focus"},
    )
    assert created.status_code == 201

    duplicate = client.post(
        "/api/profile/goals",
        headers=headers,
        json={"category": "focus"},
    )
    assert duplicate.status_code == 409

    deleted = client.delete(
        f"/api/profile/goals/{created.json()['id']}",
        headers=headers,
    )
    assert deleted.status_code == 204
