from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.streak import StreakRead
from app.services.streak_service import get_streak

router = APIRouter(prefix="/api/streaks", tags=["streaks"])


@router.get("", response_model=StreakRead)
def streaks(
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
) -> StreakRead:
	return get_streak(db, current_user)
