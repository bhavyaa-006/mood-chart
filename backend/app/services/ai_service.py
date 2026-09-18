from __future__ import annotations

import logging
from datetime import date, datetime, timedelta, timezone
from typing import Any

import httpx
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.ai_insight import AIInsight
from app.models.journal import JournalEntry
from app.models.user import User
from app.services.ai_providers.base import AIProviderError
from app.services.ai_providers.configured import ConfiguredAIProvider
from app.services.ai_providers.fallback import DeterministicFallbackProvider
from app.services.analytics_service import build_summary, build_trend, get_entries

logger = logging.getLogger(__name__)


class RateLimitError(RuntimeError):
    pass


def _safe_average(values: list[int]) -> float | None:
    return round(sum(values) / len(values), 2) if values else None


def _extract_journal_themes(db: Session, user: User, start_date: date, end_date: date) -> list[str]:
    entries = list(
        db.scalars(
            select(JournalEntry)
            .where(JournalEntry.user_id == user.id, JournalEntry.entry_date >= start_date, JournalEntry.entry_date <= end_date)
            .order_by(JournalEntry.entry_date.desc())
            .limit(5)
        )
    )
    words: list[str] = []
    for entry in entries:
        content = entry.content.lower()
        for token in ["stress", "energy", "sleep", "work", "family", "rest", "routine", "focus", "calm", "social"]:
            if token in content:
                words.append(token)
    return sorted(set(words))[:4]


def _build_analytics_context(db: Session, user: User, days: int) -> dict[str, Any]:
    end_date = datetime.now(timezone.utc).date()
    start_date = end_date - timedelta(days=max(days - 1, 0))
    entries = get_entries(db, user, start_date, end_date)
    summary = build_summary(db, user, start_date, end_date)
    mood_trend = build_trend(db, user, "mood", start_date, end_date)
    recent_delta = (mood_trend[-1].value - mood_trend[0].value) if len(mood_trend) > 1 else 0
    average_mood = summary.averages.mood if summary.averages else None
    average_stress = summary.averages.stress_level if summary.averages else None
    average_energy = summary.averages.energy_level if summary.averages else None
    trend_summary = "steady" if recent_delta == 0 else "upward" if recent_delta > 0 else "downward"
    return {
        "days": days,
        "entries": entries,
        "analytics": {
            "entry_count": summary.entry_count,
            "average_mood": average_mood,
            "average_stress": average_stress,
            "average_energy": average_energy,
            "logging_consistency": summary.logging_consistency,
            "mood_trend": recent_delta,
            "trend_summary": trend_summary,
            "supporting_metrics": {
                "entry_count": summary.entry_count,
                "average_mood": average_mood,
                "average_stress": average_stress,
                "average_energy": average_energy,
                "logging_consistency": summary.logging_consistency,
                "mood_trend": recent_delta,
            },
        },
        "trend_summary": f"The recent mood trend looks {trend_summary} over the last {len(entries)} check-ins.",
        "journal_themes": _extract_journal_themes(db, user, start_date, end_date),
        "insight_type": "mood_summary",
    }


def _provider_response(context: dict[str, Any]) -> dict[str, Any]:
    settings = get_settings()
    request = {
        "days": context["days"],
        "insight_type": context["insight_type"],
        "analytics": context["analytics"],
        "trend_summary": context["trend_summary"],
        "journal_themes": context["journal_themes"],
        "entries": context["entries"],
    }
    try:
        if settings.ai_api_key:
            payload = ConfiguredAIProvider().generate(request)
            if payload.get("summary"):
                return payload
    except (AIProviderError, httpx.HTTPError, ValueError, TypeError, KeyError) as exc:
        logger.warning("AI provider failed; falling back to deterministic insights: %s", exc)
    return DeterministicFallbackProvider().generate(request)


def _latest_user_insight(db: Session, user: User) -> AIInsight | None:
    return db.scalar(
        select(AIInsight)
        .where(AIInsight.user_id == user.id)
        .order_by(AIInsight.created_at.desc())
        .limit(1)
    )


def enforce_generation_cooldown(db: Session, user: User) -> None:
    settings = get_settings()
    latest = _latest_user_insight(db, user)
    if latest is None:
        return
    if latest.created_at.tzinfo is None:
        latest.created_at = latest.created_at.replace(tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    if latest.created_at >= now - timedelta(seconds=settings.ai_cooldown_seconds):
        raise RateLimitError("AI insight generation is temporarily rate-limited")


def generate_insight_for_user(db: Session, user: User, days: int = 14, insight_type: str = "mood_summary") -> AIInsight:
    enforce_generation_cooldown(db, user)
    context = _build_analytics_context(db, user, days)
    context["insight_type"] = insight_type
    response = _provider_response(context)
    if not isinstance(response.get("summary"), str):
        raise AIProviderError("AI provider returned malformed data")

    insight = AIInsight(
        user_id=user.id,
        insight_type=insight_type,
        title=response.get("title", "Wellbeing snapshot"),
        summary=response["summary"],
        recommendations=response.get("recommendations", ["Keep tracking consistently."]),
        supporting_metrics=response.get("supporting_metrics", {}),
        model_name=response.get("model_name", "deterministic-fallback"),
        status=response.get("status", "fallback"),
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
    )
    db.add(insight)
    db.commit()
    db.refresh(insight)
    return insight


def list_insights_for_user(db: Session, user: User, limit: int = 20, offset: int = 0) -> tuple[list[AIInsight], int]:
    total = db.scalar(select(func.count(AIInsight.id)).where(AIInsight.user_id == user.id)) or 0
    items = list(
        db.scalars(
            select(AIInsight)
            .where(AIInsight.user_id == user.id)
            .order_by(AIInsight.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
    )
    return items, int(total)


def get_insight_for_user(db: Session, user: User, insight_id: str) -> AIInsight | None:
    return db.scalar(select(AIInsight).where(AIInsight.id == insight_id, AIInsight.user_id == user.id))


def delete_insight_for_user(db: Session, user: User, insight_id: str) -> bool:
    insight = get_insight_for_user(db, user, insight_id)
    if insight is None:
        return False
    db.delete(insight)
    db.commit()
    return True
