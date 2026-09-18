from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.profile import (
	GoalCreate,
	GoalRead,
	OnboardingRequest,
	ProfileRead,
	ProfileUpdate,
)
from app.services.profile_service import (
	add_goal,
	complete_onboarding,
	delete_goal,
	get_goals,
	get_or_create_profile,
	update_profile,
)

router = APIRouter(prefix="/api/profile", tags=["profile"])


def serialize_profile(db: Session, user: User) -> ProfileRead:
	profile = get_or_create_profile(db, user)
	return ProfileRead(
		id=profile.id,
		user_id=profile.user_id,
		display_name=profile.display_name,
		timezone=profile.timezone,
		onboarding_completed=profile.onboarding_completed,
		created_at=profile.created_at,
		updated_at=profile.updated_at,
		goals=[GoalRead.model_validate(goal) for goal in get_goals(db, user.id)],
	)


@router.get("", response_model=ProfileRead)
def get_profile(
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
) -> ProfileRead:
	return serialize_profile(db, current_user)


@router.patch("", response_model=ProfileRead)
def patch_profile(
	profile_data: ProfileUpdate,
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
) -> ProfileRead:
	update_profile(db, current_user, profile_data)
	return serialize_profile(db, current_user)


@router.post("/onboarding", response_model=ProfileRead)
def onboarding(
	onboarding_data: OnboardingRequest,
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
) -> ProfileRead:
	complete_onboarding(db, current_user, onboarding_data)
	return serialize_profile(db, current_user)


@router.get("/goals", response_model=list[GoalRead])
def list_goals(
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
) -> list[GoalRead]:
	return [GoalRead.model_validate(goal) for goal in get_goals(db, current_user.id)]


@router.post("/goals", response_model=GoalRead, status_code=status.HTTP_201_CREATED)
def create_goal(
	goal_data: GoalCreate,
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
) -> GoalRead:
	try:
		return add_goal(db, current_user, goal_data.category.value)
	except IntegrityError:
		db.rollback()
		raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Practice goal already selected") from None


@router.delete("/goals/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_goal(
	goal_id: str,
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
) -> None:
	if not delete_goal(db, current_user, goal_id):
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Practice goal not found")
