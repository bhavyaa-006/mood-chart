from datetime import date, datetime
from uuid import uuid4

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base
from app.models.user import utc_now


class Streak(Base):
	__tablename__ = "streaks"

	id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
	user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
	current_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
	longest_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
	last_activity_date: Mapped[date | None] = mapped_column(Date, nullable=True)
	total_logs: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
	xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
	updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)
