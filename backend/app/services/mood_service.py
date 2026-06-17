from collections import Counter
from datetime import date, timedelta

from app.core.constants import MOOD_METADATA
from app.models.mood import Mood


def create_or_update_today_mood(db, payload, user_id: int):
    today = date.today()

    existing = (
        db.query(Mood)
        .filter(Mood.user_id == user_id, Mood.entry_date == today)
        .first()
    )

    if existing:
        existing.mood = payload.mood
        existing.note = payload.note

        db.commit()
        db.refresh(existing)

        return existing

    mood = Mood(
        user_id=user_id,
        mood=payload.mood,
        note=payload.note,
        entry_date=today,
    )

    db.add(mood)

    db.commit()

    db.refresh(mood)

    return mood


def get_today_mood(db, user_id: int):
    return (
        db.query(Mood)
        .filter(Mood.user_id == user_id, Mood.entry_date == date.today())
        .first()
    )


def get_mood_history(db, user_id: int):
    return (
        db.query(Mood)
        .filter(Mood.user_id == user_id)
        .order_by(Mood.entry_date.desc())
        .all()
    )


def get_analytics(db, user_id: int):
    moods = (
        db.query(Mood)
        .filter(Mood.user_id == user_id)
        .order_by(Mood.entry_date.asc())
        .all()
    )

    if not moods:
        return {
            "total_entries": 0,
            "average_score": 0,
            "most_common_mood": None,
            "current_streak": 0,
        }

    total_entries = len(moods)

    scores = [
        MOOD_METADATA[mood.mood]["score"]
        for mood in moods
    ]

    average_score = round(
        sum(scores) / total_entries,
        1,
    )

    mood_counter = Counter(
        mood.mood for mood in moods
    )

    most_common_mood = mood_counter.most_common(1)[0][0]

    streak = 0

    expected_date = date.today()

    for mood in reversed(moods):

        if mood.entry_date == expected_date:
            streak += 1
            expected_date -= timedelta(days=1)

        elif mood.entry_date < expected_date:
            break

    return {
        "total_entries": total_entries,
        "average_score": average_score,
        "most_common_mood": most_common_mood,
        "current_streak": streak,
    }
