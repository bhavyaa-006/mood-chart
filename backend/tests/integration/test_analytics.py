from datetime import date, timedelta

from tests.integration.test_mood_journal import (
	Base,
	app,
	authenticated_headers,
	client,
	engine,
	override_get_db,
)


def setup_module() -> None:
	app.dependency_overrides.clear()
	app.dependency_overrides[__import__("app.db.session", fromlist=["get_db"]).get_db] = override_get_db
	Base.metadata.create_all(bind=engine)


def setup_function() -> None:
	Base.metadata.drop_all(bind=engine)
	Base.metadata.create_all(bind=engine)


def teardown_module() -> None:
	app.dependency_overrides.clear()
	Base.metadata.drop_all(bind=engine)


def test_analytics_summary_trends_calendar_and_correlations() -> None:
	headers = authenticated_headers("analytics@example.com")
	start = date(2026, 9, 15)
	entries = [(5, 1, 4), (3, 3, 3), (4, 2, 5)]
	for offset, (mood, stress, energy) in enumerate(entries):
		response = client.post(
			"/api/moods",
			headers=headers,
			json={
				"mood": mood,
				"stress_level": stress,
				"energy_level": energy,
				"entry_date": str(start + timedelta(days=offset)),
			},
		)
		assert response.status_code == 201

	summary = client.get(
		"/api/analytics/summary",
		headers=headers,
		params={"start_date": "2026-09-15", "end_date": "2026-09-17"},
	)
	assert summary.status_code == 200
	assert summary.json()["entry_count"] == 3
	assert summary.json()["averages"] == {"mood": 4.0, "stress_level": 2.0, "energy_level": 4.0}
	assert summary.json()["logging_consistency"] == 100.0
	assert summary.json()["weekly_averages"]
	assert summary.json()["monthly_averages"]

	trends = client.get("/api/analytics/mood-trends", headers=headers)
	assert trends.status_code == 200
	assert [item["value"] for item in trends.json()] == [5, 3, 4]

	calendar = client.get("/api/analytics/calendar", headers=headers)
	assert calendar.status_code == 200
	assert len(calendar.json()) == 3

	correlations = client.get("/api/analytics/correlations", headers=headers)
	assert correlations.status_code == 200
	assert correlations.json()["mood_stress"] is not None


def test_empty_analytics_history_is_explicit() -> None:
	headers = authenticated_headers("empty-analytics@example.com")
	response = client.get("/api/analytics/summary", headers=headers)

	assert response.status_code == 200
	assert response.json()["entry_count"] == 0
	assert response.json()["averages"] is None
	assert response.json()["logging_consistency"] == 0.0
