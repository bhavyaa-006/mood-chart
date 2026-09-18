from datetime import date, datetime, timedelta, timezone
from itertools import pairwise

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.mood import MoodEntry
from app.models.streak import Streak
from app.models.user import User


def consecutive_lengths(dates: list[date]) -> list[int]:
	if not dates:
		return []
	lengths: list[int] = []
	current = 1
	for previous, value in pairwise(dates):
		if value == previous + timedelta(days=1):
			current += 1
		else:
			lengths.append(current)
			current = 1
	lengths.append(current)
	return lengths


def get_streak(db: Session, user: User) -> Streak:
	dates = list(
		db.scalars(
			select(MoodEntry.entry_date)
			.where(MoodEntry.user_id == user.id)
			.order_by(MoodEntry.entry_date)
		)
	)
	unique_dates = sorted(set(dates))
	lengths = consecutive_lengths(unique_dates)
	latest_date = unique_dates[-1] if unique_dates else None
	active = latest_date is not None and latest_date >= datetime.now(timezone.utc).date() - timedelta(days=1)
	current = lengths[-1] if active and lengths else 0
	longest = max(lengths, default=0)
	total_logs = len(unique_dates)
	streak = db.scalar(select(Streak).where(Streak.user_id == user.id))
	if streak is None:
		streak = Streak(user_id=user.id)
		db.add(streak)
	streak.current_streak = current
	streak.longest_streak = longest
	streak.last_activity_date = latest_date
	streak.total_logs = total_logs
	streak.xp = total_logs * 10
	db.commit()
	db.refresh(streak)
	return streak
