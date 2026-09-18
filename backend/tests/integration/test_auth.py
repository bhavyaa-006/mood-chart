from collections.abc import Generator

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base
from app.db.session import get_db
from app.main import app
from app.models.user import User
from app.services.auth_service import create_password_reset_token

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


def teardown_module() -> None:
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


def test_register_login_and_get_current_user() -> None:
    registration = client.post(
        "/api/auth/register",
        json={"email": "wellness@example.com", "password": "Strong-password-123"},
    )

    assert registration.status_code == 201
    public_user = registration.json()
    assert public_user["email"] == "wellness@example.com"
    assert "hashed_password" not in public_user

    login = client.post(
        "/api/auth/login",
        data={"username": "wellness@example.com", "password": "Strong-password-123"},
    )

    assert login.status_code == 200
    token = login.json()["access_token"]
    refresh_token = login.json()["refresh_token"]
    assert login.json()["token_type"] == "bearer"

    current_user = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert current_user.status_code == 200
    assert current_user.json()["id"] == public_user["id"]

    rotated = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert rotated.status_code == 200
    assert rotated.json()["refresh_token"] != refresh_token

    old_refresh = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert old_refresh.status_code == 401

    logout = client.post("/api/auth/logout", json={"refresh_token": rotated.json()["refresh_token"]})
    assert logout.status_code == 204

    revoked_refresh = client.post(
        "/api/auth/refresh", json={"refresh_token": rotated.json()["refresh_token"]}
    )
    assert revoked_refresh.status_code == 401


def test_duplicate_registration_and_unauthenticated_me_are_rejected() -> None:
    duplicate = client.post(
        "/api/auth/register",
        json={"email": "wellness@example.com", "password": "Another-password-123"},
    )

    assert duplicate.status_code == 409
    assert client.get("/api/auth/me").status_code == 401


def test_password_reset_token_is_single_use() -> None:
    db = TestingSessionLocal()
    try:
        user = db.query(User).filter_by(email="wellness@example.com").one()
        reset_token = create_password_reset_token(db, user)
    finally:
        db.close()

    request = client.post("/api/auth/reset-password", json={"token": reset_token, "password": "New-password-123"})
    assert request.status_code == 200

    second_use = client.post(
        "/api/auth/reset-password", json={"token": reset_token, "password": "Another-password-123"}
    )
    assert second_use.status_code == 400


def test_forgot_password_response_does_not_reveal_account_existence() -> None:
    existing = client.post("/api/auth/forgot-password", json={"email": "wellness@example.com"})
    missing = client.post("/api/auth/forgot-password", json={"email": "missing@example.com"})

    assert existing.status_code == 202
    assert missing.status_code == 202
    assert existing.json() == missing.json()
