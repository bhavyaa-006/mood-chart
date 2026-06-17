from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.core.constants import MOOD_METADATA
from app.db.database import get_db
from app.models.mood_scale import MoodScale
from app.schemas.mood import MoodCreate
from app.services import mood_service

router = APIRouter(
    prefix="/moods",
    tags=["Moods"],
)


@router.get("/scale")
def get_mood_scale():
    return [
        {
            "value": mood.value,
            **MOOD_METADATA[mood.value],
        }
        for mood in MoodScale
    ]


@router.post("/")
def create_or_update_mood(
    payload: MoodCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return mood_service.create_or_update_today_mood(
        db,
        payload,
        current_user.id,
    )


@router.get("/today")
def get_today_mood(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return mood_service.get_today_mood(db, current_user.id)


@router.get("/history")
def get_mood_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return mood_service.get_mood_history(db, current_user.id)


@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return mood_service.get_analytics(db, current_user.id)


@router.get("/calendar")
def get_calendar(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Map mood score to legend categories requested by UI
    def mood_to_category(mood_value: str | None) -> str:
        if not mood_value:
            return "Neutral"
        if mood_value == "excellent":
            return "Excellent"
        if mood_value == "good":
            return "Happy"
        if mood_value == "neutral":
            return "Neutral"
        if mood_value == "bad":
            return "Sad"
        if mood_value == "very_bad":
            return "Stressed"
        return "Neutral"

    # Inclusive month range
    from datetime import date as _date, timedelta as _timedelta

    start = _date(year, month, 1)
    if month == 12:
        nxt = _date(year + 1, 1, 1)
    else:
        nxt = _date(year, month + 1, 1)
    end = nxt - _timedelta(days=1)

    entries = (
        db.query(Mood)
        .filter(
            Mood.user_id == current_user.id,
            Mood.entry_date >= start,
            Mood.entry_date <= end,
        )
        .all()
    )

    entry_by_date = {e.entry_date: e for e in entries}

    # For hover: include a lightweight AI summary per month (reusing analytics endpoint for now)
    analytics = mood_service.get_analytics(db, current_user.id)
    common = analytics.get("most_common_mood")

    month_insight = None
    if common == "excellent":
        month_insight = "This month was predominantly positive with occasional stress spikes during weekdays."
    elif common == "good":
        month_insight = "Your emotional pattern is mostly stable and supportive, with small fluctuations."
    elif common == "bad" or common == "very_bad":
        month_insight = "You may have experienced heavier emotional days—consider adding short mid-week reflection."
    else:
        month_insight = "This month shows a balanced mix—keep building consistent emotional awareness."

    days = []
    d = start
    while d <= end:
        e = entry_by_date.get(d)
        mood_value = e.mood if e else None
        days.append(
            {
                "date": d.isoformat(),
                "day": d.day,
                "mood": mood_value,
                "note": getattr(e, "note", None) if e else None,
                "category": mood_to_category(mood_value),
                "ai_insights": month_insight,
            }
        )
        d += _timedelta(days=1)

    return {
        "year": year,
        "month": month,
        "days": days,
    }
