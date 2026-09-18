from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.achievement import AchievementRead
from app.services.achievement_service import list_achievements
from app.services.streak_service import get_streak

router = APIRouter(prefix="/api/achievements", tags=["achievements"])


def serialize(achievement, unlocked) -> AchievementRead:
	return AchievementRead(
		id=achievement.id,
		name=achievement.name,
		description=achievement.description,
		requirement_type=achievement.requirement_type,
		requirement_value=achievement.requirement_value,
		unlocked_at=unlocked.unlocked_at if unlocked else None,
	)


@router.get("", response_model=list[AchievementRead])
def achievements(
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
) -> list[AchievementRead]:
	get_streak(db, current_user)
	return [serialize(achievement, unlocked) for achievement, unlocked in list_achievements(db, current_user)]


@router.get("/unlocked", response_model=list[AchievementRead])
def unlocked_achievements(
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
) -> list[AchievementRead]:
	get_streak(db, current_user)
	return [
		serialize(achievement, unlocked)
		for achievement, unlocked in list_achievements(db, current_user, unlocked_only=True)
	]
