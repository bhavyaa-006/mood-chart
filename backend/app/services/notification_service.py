from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.notification import NotificationPreference
from app.models.user import User
from app.schemas.notification import NotificationPreferenceUpdate


def get_or_create_preferences(db: Session, user: User) -> NotificationPreference:
	preferences = db.scalar(select(NotificationPreference).where(NotificationPreference.user_id == user.id))
	if preferences is None:
		preferences = NotificationPreference(user_id=user.id)
		db.add(preferences)
		db.commit()
		db.refresh(preferences)
	return preferences


def update_preferences(
	db: Session, user: User, preference_data: NotificationPreferenceUpdate
) -> NotificationPreference:
	preferences = get_or_create_preferences(db, user)
	for field, value in preference_data.model_dump(exclude_unset=True).items():
		setattr(preferences, field, value)
	db.commit()
	db.refresh(preferences)
	return preferences
