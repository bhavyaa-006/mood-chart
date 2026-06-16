from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.mood import MoodCreate
from app.services import mood_service
from app.models.mood_scale import MoodScale

router = APIRouter(
    prefix="/moods",
    tags=["Moods"],
)


@router.get("/scale")
def get_mood_scale():
    return [
        {
            "value": mood.value,
            "label": mood.value.replace("_", " ").title(),
        }
        for mood in MoodScale
    ]


@router.post("/")
def create_or_update_mood(
    payload: MoodCreate,
    db: Session = Depends(get_db),
):
    return mood_service.create_or_update_today_mood(
        db,
        payload,
    )


@router.get("/today")
def get_today_mood(
    db: Session = Depends(get_db),
):
    return mood_service.get_today_mood(db)