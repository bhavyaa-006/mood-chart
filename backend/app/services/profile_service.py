from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.practice_goal import PracticeGoal
from app.models.profile import Profile
from app.models.user import User
from app.schemas.profile import OnboardingRequest, ProfileUpdate


def get_or_create_profile(db: Session, user: User) -> Profile:
	profile = db.scalar(select(Profile).where(Profile.user_id == user.id))
	if profile is None:
		profile = Profile(user_id=user.id)
		db.add(profile)
		db.commit()
		db.refresh(profile)
	return profile


def get_goals(db: Session, user_id: str) -> list[PracticeGoal]:
	return list(db.scalars(select(PracticeGoal).where(PracticeGoal.user_id == user_id).order_by(PracticeGoal.created_at)))


def update_profile(db: Session, user: User, profile_data: ProfileUpdate) -> Profile:
	profile = get_or_create_profile(db, user)
	for field, value in profile_data.model_dump(exclude_unset=True).items():
		setattr(profile, field, value)
	db.commit()
	db.refresh(profile)
	return profile


def complete_onboarding(db: Session, user: User, onboarding_data: OnboardingRequest) -> Profile:
	profile = get_or_create_profile(db, user)
	profile.display_name = onboarding_data.display_name
	profile.timezone = onboarding_data.timezone or profile.timezone
	profile.onboarding_completed = True
	db.execute(delete(PracticeGoal).where(PracticeGoal.user_id == user.id))
	db.add_all(
		PracticeGoal(user_id=user.id, category=goal.value)
		for goal in onboarding_data.goals
	)
	db.commit()
	db.refresh(profile)
	return profile


def add_goal(db: Session, user: User, category: str) -> PracticeGoal:
	goal = PracticeGoal(user_id=user.id, category=category)
	db.add(goal)
	db.commit()
	db.refresh(goal)
	return goal


def delete_goal(db: Session, user: User, goal_id: str) -> bool:
	goal = db.scalar(select(PracticeGoal).where(PracticeGoal.id == goal_id, PracticeGoal.user_id == user.id))
	if goal is None:
		return False
	db.delete(goal)
	db.commit()
	return True
