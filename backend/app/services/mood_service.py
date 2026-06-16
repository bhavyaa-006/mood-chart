from datetime import date

from app.models.mood import Mood


def create_or_update_today_mood(db, payload):
    today = date.today()

    existing = (
        db.query(Mood)
        .filter(Mood.entry_date == today)
        .first()
    )

    if existing:
        existing.mood = payload.mood
        existing.note = payload.note

        db.commit()
        db.refresh(existing)

        return existing

    mood = Mood(
        mood=payload.mood,
        note=payload.note,
        entry_date=today,
    )

    db.add(mood)

    db.commit()
    db.refresh(mood)

    return mood


def get_today_mood(db):
    return (
        db.query(Mood)
        .filter(Mood.entry_date == date.today())
        .first()
    )
def get_mood_history(db):
    return (
        db.query(Mood)
        .order_by(Mood.entry_date.desc())
        .all()
    )