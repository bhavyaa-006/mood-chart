from datetime import date

from pydantic import BaseModel


class StreakRead(BaseModel):
	current_streak: int
	longest_streak: int
	last_activity_date: date | None
	total_logs: int
	xp: int
