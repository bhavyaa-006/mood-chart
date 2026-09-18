from collections import defaultdict
from datetime import date
from math import sqrt

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.mood import MoodEntry
from app.models.user import User
from app.schemas.analytics import (
	AnalyticsAverages,
	AnalyticsSummary,
	CalendarPoint,
	CorrelationResponse,
	PeriodAverage,
	TrendPoint,
)


def get_entries(
	db: Session, user: User, start_date: date | None = None, end_date: date | None = None
) -> list[MoodEntry]:
	query = select(MoodEntry).where(MoodEntry.user_id == user.id)
	if start_date:
		query = query.where(MoodEntry.entry_date >= start_date)
	if end_date:
		query = query.where(MoodEntry.entry_date <= end_date)
	return list(db.scalars(query.order_by(MoodEntry.entry_date)))


def average(values: list[int]) -> float:
	return round(sum(values) / len(values), 2)


def period_averages(entries: list[MoodEntry], period: str) -> list[PeriodAverage]:
	grouped: dict[str, list[MoodEntry]] = defaultdict(list)
	for entry in entries:
		key = entry.entry_date.strftime("%Y-W%V") if period == "week" else entry.entry_date.strftime("%Y-%m")
		grouped[key].append(entry)
	return [
		PeriodAverage(
			period=key,
			mood=average([entry.mood for entry in values]),
			stress_level=average([entry.stress_level for entry in values]),
			energy_level=average([entry.energy_level for entry in values]),
		)
		for key, values in sorted(grouped.items())
	]


def build_summary(
	db: Session, user: User, start_date: date | None = None, end_date: date | None = None
) -> AnalyticsSummary:
	entries = get_entries(db, user, start_date, end_date)
	averages = None
	if entries:
		averages = AnalyticsAverages(
			mood=average([entry.mood for entry in entries]),
			stress_level=average([entry.stress_level for entry in entries]),
			energy_level=average([entry.energy_level for entry in entries]),
		)
	if start_date and end_date:
		calendar_days = (end_date - start_date).days + 1
	else:
		calendar_days = len({entry.entry_date for entry in entries})
	consistency = round(len(entries) / calendar_days * 100, 2) if calendar_days else 0.0
	return AnalyticsSummary(
		entry_count=len(entries),
		averages=averages,
		mood_distribution={str(value): sum(entry.mood == value for entry in entries) for value in range(1, 6)},
		weekly_averages=period_averages(entries, "week"),
		monthly_averages=period_averages(entries, "month"),
		logging_consistency=consistency,
	)


def build_trend(
	db: Session, user: User, metric: str, start_date: date | None = None, end_date: date | None = None
) -> list[TrendPoint]:
	return [TrendPoint(entry_date=entry.entry_date, value=getattr(entry, metric)) for entry in get_entries(db, user, start_date, end_date)]


def build_calendar(
	db: Session, user: User, start_date: date | None = None, end_date: date | None = None
) -> list[CalendarPoint]:
	return [
		CalendarPoint(
			entry_date=entry.entry_date,
			mood=entry.mood,
			stress_level=entry.stress_level,
			energy_level=entry.energy_level,
		)
		for entry in get_entries(db, user, start_date, end_date)
	]


def correlation(first: list[int], second: list[int]) -> float | None:
	if len(first) < 3:
		return None
	first_mean = sum(first) / len(first)
	second_mean = sum(second) / len(second)
	numerator = sum((left - first_mean) * (right - second_mean) for left, right in zip(first, second))
	first_variance = sum((value - first_mean) ** 2 for value in first)
	second_variance = sum((value - second_mean) ** 2 for value in second)
	if first_variance == 0 or second_variance == 0:
		return None
	return round(numerator / sqrt(first_variance * second_variance), 4)


def build_correlations(
	db: Session, user: User, start_date: date | None = None, end_date: date | None = None
) -> CorrelationResponse:
	entries = get_entries(db, user, start_date, end_date)
	moods = [entry.mood for entry in entries]
	stress = [entry.stress_level for entry in entries]
	energy = [entry.energy_level for entry in entries]
	return CorrelationResponse(
		mood_stress=correlation(moods, stress),
		mood_energy=correlation(moods, energy),
		stress_energy=correlation(stress, energy),
	)
