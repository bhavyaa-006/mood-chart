from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.activity import Activity, ActivitySession
from app.models.user import User
from app.schemas.activity import ActivitySessionComplete, ActivitySessionCreate

DEFAULT_ACTIVITIES = (
	("Box Breathing", "A paced breathing exercise for a short reset.", "breathing", "beginner"),
	("Mindful Minute", "A one-minute attention practice using the senses.", "mindfulness", "beginner"),
	("Focus Sprint", "A short guided focus interval.", "focus", "intermediate"),
	("Memory Match", "A lightweight memory exercise.", "cognitive", "intermediate"),
	("Reaction Reset", "A simple attention and reaction activity.", "attention", "intermediate"),
	("Reflection Prompt", "A structured reflection activity.", "reflection", "beginner"),
	("Body Scan", "A calm progressive relaxation practice.", "relaxation", "beginner"),
	("Three Good Things", "A gratitude-focused reflection activity.", "gratitude", "beginner"),
)


def ensure_default_activities(db: Session) -> list[Activity]:
	for name, description, category, difficulty in DEFAULT_ACTIVITIES:
		if db.scalar(select(Activity).where(Activity.name == name)) is None:
			db.add(
				Activity(
					name=name,
					description=description,
					category=category,
					difficulty=difficulty,
				)
		)
	db.commit()
	return list(db.scalars(select(Activity).where(Activity.is_active.is_(True)).order_by(Activity.name)))


def list_activities(db: Session) -> list[Activity]:
	return ensure_default_activities(db)


def get_activity(db: Session, activity_id: str) -> Activity | None:
	ensure_default_activities(db)
	return db.scalar(select(Activity).where(Activity.id == activity_id, Activity.is_active.is_(True)))


def create_session(
	db: Session, user: User, activity: Activity, session_data: ActivitySessionCreate
) -> ActivitySession:
	activity_session = ActivitySession(
		user_id=user.id,
		activity_id=activity.id,
		started_at=session_data.started_at or datetime.now(timezone.utc),
		score=session_data.score,
		metadata_json=session_data.metadata,
	)
	db.add(activity_session)
	db.commit()
	db.refresh(activity_session)
	return activity_session


def get_session(db: Session, user: User, session_id: str) -> ActivitySession | None:
	return db.scalar(
		select(ActivitySession).where(ActivitySession.id == session_id, ActivitySession.user_id == user.id)
	)


def complete_session(
	db: Session, activity_session: ActivitySession, completion: ActivitySessionComplete
) -> ActivitySession:
	if activity_session.completed_at is not None:
		return activity_session
	activity_session.completed_at = datetime.now(timezone.utc)
	if completion.score is not None:
		activity_session.score = completion.score
	if completion.metadata is not None:
		activity_session.metadata_json = completion.metadata
	db.commit()
	db.refresh(activity_session)
	return activity_session


def list_sessions(db: Session, user: User) -> list[ActivitySession]:
	return list(
		db.scalars(
			select(ActivitySession)
			.where(ActivitySession.user_id == user.id)
			.order_by(ActivitySession.started_at.desc())
		)
	)
