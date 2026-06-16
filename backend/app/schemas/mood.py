from datetime import date, datetime

from pydantic import BaseModel

from app.models.mood_scale import MoodScale


class MoodCreate(BaseModel):
    mood: MoodScale
    note: str | None = None


class MoodResponse(BaseModel):
    id: int
    mood: MoodScale
    note: str | None
    entry_date: date
    created_at: datetime

    class Config:
        from_attributes = True