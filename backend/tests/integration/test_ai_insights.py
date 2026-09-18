from datetime import date, timedelta

from fastapi.testclient import TestClient

from app.db.database import Base
from app.db.session import get_db
from app.main import app
from tests.integration.test_mood_journal import engine, override_get_db

client = TestClient(app)


def setup_module() -> None:
    app.dependency_overrides.clear()
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.create_all(bind=engine)


def setup_function() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def teardown_module() -> None:
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


def authenticated_headers(email: str = "ai@example.com") -> dict[str, str]:
    client.post("/api/auth/register", json={"email": email, "password": "Strong-password-123"})
    token = client.post(
        "/api/auth/login",
        data={"username": email, "password": "Strong-password-123"},
    ).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def create_moods(headers: dict[str, str], start_date: date, values: list[tuple[int, int, int]]) -> None:
    for offset, (mood, stress, energy) in enumerate(values):
        response = client.post(
            "/api/moods",
            headers=headers,
            json={
                "mood": mood,
                "stress_level": stress,
                "energy_level": energy,
                "entry_date": str(start_date + timedelta(days=offset)),
                "notes": "Test note",
            },
        )
        assert response.status_code == 201, response.text


def test_generate_ai_insight_and_paginated_list() -> None:
    headers = authenticated_headers("insight-user@example.com")
    start = date(2026, 9, 15)
    create_moods(headers, start, [(5, 2, 4), (4, 2, 5), (3, 3, 3), (4, 3, 4)])

    response = client.post(
        "/api/ai-insights/generate",
        headers=headers,
        json={"days": 14, "insight_type": "mood_summary"},
    )
    assert response.status_code == 200, response.text
    payload = response.json()
    assert payload["summary"]
    assert payload["recommendations"]
    assert payload["status"] in {"generated", "fallback"}

    list_response = client.get("/api/ai-insights", headers=headers, params={"limit": 1, "offset": 0})
    assert list_response.status_code == 200
    assert list_response.json()["total"] >= 1
    assert len(list_response.json()["items"]) == 1

    get_response = client.get(f"/api/ai-insights/{payload['id']}", headers=headers)
    assert get_response.status_code == 200
    assert get_response.json()["id"] == payload["id"]


def test_ai_insight_requires_auth_and_restricts_cross_user_access() -> None:
    first_headers = authenticated_headers("user-one@example.com")
    second_headers = authenticated_headers("user-two@example.com")
    start = date(2026, 9, 15)
    create_moods(first_headers, start, [(4, 2, 5), (3, 3, 3)])

    generated = client.post(
        "/api/ai-insights/generate",
        headers=first_headers,
        json={"days": 14, "insight_type": "mood_summary"},
    )
    insight_id = generated.json()["id"]

    unauth = client.get(f"/api/ai-insights/{insight_id}")
    assert unauth.status_code == 401

    forbidden = client.get(f"/api/ai-insights/{insight_id}", headers=second_headers)
    assert forbidden.status_code == 403


def test_generation_cooldown_and_empty_history_are_handled() -> None:
    headers = authenticated_headers("cooldown@example.com")
    first = client.post(
        "/api/ai-insights/generate",
        headers=headers,
        json={"days": 14, "insight_type": "mood_summary"},
    )
    assert first.status_code == 200

    second = client.post(
        "/api/ai-insights/generate",
        headers=headers,
        json={"days": 14, "insight_type": "mood_summary"},
    )
    assert second.status_code == 429

    empty_headers = authenticated_headers("empty@example.com")
    empty_response = client.post(
        "/api/ai-insights/generate",
        headers=empty_headers,
        json={"days": 14, "insight_type": "mood_summary"},
    )
    assert empty_response.status_code == 200
    assert empty_response.json()["summary"]
