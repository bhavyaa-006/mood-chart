from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.achievement import Achievement, UserAchievement
from app.models.streak import Streak
from app.models.user import User, utc_now

DEFAULT_ACHIEVEMENTS = (
	("First Check-In", "Logged your first mood check-in.", 1),
	("Three-Day Rhythm", "Logged mood entries on three days.", 3),
	("Week of Reflection", "Logged mood entries on seven days.", 7),
)


def ensure_default_achievements(db: Session) -> list[Achievement]:
	for name, description, requirement_value in DEFAULT_ACHIEVEMENTS:
		achievement = db.scalar(select(Achievement).where(Achievement.name == name))
		if achievement is None:
			db.add(
				Achievement(
					name=name,
					description=description,
					requirement_type="total_logs",
					requirement_value=requirement_value,
				)
			)
	db.commit()
	return list(db.scalars(select(Achievement).order_by(Achievement.requirement_value)))


def list_achievements(db: Session, user: User, unlocked_only: bool = False) -> list[tuple[Achievement, object | None]]:
	achievements = ensure_default_achievements(db)
	streak = db.scalar(select(Streak).where(Streak.user_id == user.id))
	user_achievements = {
		item.achievement_id: item
		for item in db.scalars(select(UserAchievement).where(UserAchievement.user_id == user.id))
	}
	total_logs = streak.total_logs if streak else 0
	for achievement in achievements:
		if total_logs >= achievement.requirement_value and achievement.id not in user_achievements:
			unlocked = UserAchievement(user_id=user.id, achievement_id=achievement.id, unlocked_at=utc_now())
			db.add(unlocked)
			user_achievements[achievement.id] = unlocked
	db.commit()
	if unlocked_only:
		achievements = [achievement for achievement in achievements if achievement.id in user_achievements]
	return [(achievement, user_achievements.get(achievement.id)) for achievement in achievements]
