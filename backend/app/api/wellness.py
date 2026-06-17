from collections import Counter
from datetime import date, timedelta
from typing import Literal

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.core.constants import MOOD_METADATA
from app.db.database import get_db
from app.models.mood import Mood
from app.services import mood_service

router = APIRouter(prefix="/wellness", tags=["Wellness"])


def _score_to_category(score: int) -> str:
    # Keep categories aligned with UI legend requested later
    for key, meta in MOOD_METADATA.items():
        if meta["score"] == score:
            return meta["label"]  # e.g., "Excellent"
    return "Neutral"


def _compute_week_range(anchor: date) -> tuple[date, date]:
    # Monday-start week for deterministic “weekly” insights.
    start = anchor - timedelta(days=anchor.weekday())
    end = start + timedelta(days=6)
    return start, end


def _compute_month_range(year: int, month: int) -> tuple[date, date]:
    start = date(year, month, 1)
    # month end: go to next month then subtract a day
    if month == 12:
        nxt = date(year + 1, 1, 1)
    else:
        nxt = date(year, month + 1, 1)
    end = nxt - timedelta(days=1)
    return start, end


@router.get("/points")
def get_points(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    moods = mood_service.get_mood_history(db, current_user.id)
    total_entries = len(moods)

    analytics = mood_service.get_analytics(db, current_user.id)
    current_streak = analytics.get("current_streak", 0)

    points = 0
    points += total_entries * 10
    points += current_streak * 20

    # Weekly consistency bonus: number of distinct weeks with >=3 entries, *50
    if total_entries > 0:
        week_keys = set()
        for m in moods:
            wk_start = m.entry_date - timedelta(days=m.entry_date.weekday())
            week_keys.add(wk_start)
        weekly_consistency_bonus = len(week_keys) * 50
        points += weekly_consistency_bonus

    # Simple level curve
    # Level 1 starts at 0 xp; each level needs 500*(level) points
    level = 1
    xp = points
    next_level_threshold = 500
    while xp >= next_level_threshold:
        xp -= next_level_threshold
        level += 1
        next_level_threshold = 500 * level

    return {
        "total_entries": total_entries,
        "current_streak": current_streak,
        "points": points,
        "level": level,
        "xp": xp,
        "xp_next": next_level_threshold,
        "achievements": [
            {"name": "7-Day Streak", "unlocked": current_streak >= 7},
            {"name": "30-Day Champion", "unlocked": total_entries >= 30},
        ],
    }


@router.get("/ai/insights")
def get_ai_insights(
    range: Literal["weekly", "monthly"] = "weekly",
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    moods = mood_service.get_mood_history(db, current_user.id)
    if not moods:
        return {
            "weekly": [],
            "monthly": [],
            "emotional_balance_score": 0,
            "mood_consistency_score": 0,
            "predictions": [],
            "suggestions": [],
        }

    today = date.today()
    if range == "weekly":
        start, end = _compute_week_range(today)
        relevant = [m for m in moods if start <= m.entry_date <= end]
    else:
        start, end = _compute_month_range(today.year, today.month)
        relevant = [m for m in moods if start <= m.entry_date <= end]

    if not relevant:
        relevant = moods[-min(len(moods), 7):]  # fallback

    scores = [MOOD_METADATA[m.mood]["score"] for m in relevant if m.mood in MOOD_METADATA]
    if not scores:
        return {
            "weekly": [],
            "monthly": [],
            "emotional_balance_score": 0,
            "mood_consistency_score": 0,
            "predictions": [],
            "suggestions": [],
        }

    avg = sum(scores) / len(scores)
    # Emotional balance score: normalize 1..5 to 0..100 around “good balance”
    emotional_balance_score = round(((avg - 1) / 4) * 100, 0)

    # Consistency score: inverse of mood score volatility
    mean = avg
    variance = sum((s - mean) ** 2 for s in scores) / len(scores)
    volatility = variance ** 0.5
    mood_consistency_score = round(max(0, 100 - (volatility * 28)), 0)

    day_to_score = Counter(m.entry_date.weekday() for m in relevant)
    weekend_count = sum(
        1 for m in relevant if m.entry_date.weekday() in (5, 6)
    )
    midweek_count = sum(
        1 for m in relevant if m.entry_date.weekday() in (1, 2, 3)  # Tue-Thu
    )

    insight_cards = []

    if weekend_count > midweek_count:
        insight_cards.append("You tend to feel happiest on weekends.")
    if midweek_count > weekend_count:
        insight_cards.append("Stress levels increase before mid-week.")

    # streak-based improvement insight
    analytics = mood_service.get_analytics(db, current_user.id)
    streak = analytics.get("current_streak", 0)
    if streak >= 5:
        insight_cards.append("Your mood improves after maintaining a 5-day streak.")

    # positive emotional consistency this month
    this_month_start, this_month_end = _compute_month_range(today.year, today.month)
    month_relevant = [m for m in moods if this_month_start <= m.entry_date <= this_month_end]
    if month_relevant:
        month_scores = [MOOD_METADATA[m.mood]["score"] for m in month_relevant if m.mood in MOOD_METADATA]
        month_avg = sum(month_scores) / len(month_scores)
        if month_avg >= 3.8:
            insight_cards.append("You have shown positive emotional consistency this month.")

    # Predictions: next-week likely based on moving average trend
    # Compare last 7 vs prior 7 (if available)
    ordered = sorted(moods, key=lambda m: m.entry_date)
    last_7 = ordered[-7:]
    prior_7 = ordered[-14:-7]
    if prior_7 and last_7:
        last_avg = sum(MOOD_METADATA[m.mood]["score"] for m in last_7) / len(last_7)
        prior_avg = sum(MOOD_METADATA[m.mood]["score"] for m in prior_7) / len(prior_7)
        delta = last_avg - prior_avg
        if delta >= 0.4:
            predictions = ["Your emotional trend is trending upward—expect calmer days ahead."]
        elif delta <= -0.4:
            predictions = ["Your emotional trend is slightly downward—consider a short reset routine."]
        else:
            predictions = ["Your emotional trend looks stable—small habits will compound."]
    else:
        predictions = ["Continue your reflection to reveal clearer emotional patterns."]

    suggestions = [
        "Pick one moment today to name your emotion—then choose a supportive action.",
        "If you notice mid-week stress, try a 3-minute breathing reset before your busiest block.",
    ]

    response = {
        "weekly": insight_cards if range == "weekly" else [],
        "monthly": insight_cards if range == "monthly" else [],
        "emotional_balance_score": emotional_balance_score,
        "mood_consistency_score": mood_consistency_score,
        "predictions": predictions,
        "suggestions": suggestions,
    }
    return response
