from datetime import date, datetime
from uuid import uuid4

from sqlalchemy import (
	Date,
	DateTime,
	ForeignKey,
	Integer,
	String,
	Text,
	UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base
from app.models.user import utc_now


class MoodEntry(Base):
	__tablename__ = "mood_entries"
	__table_args__ = (UniqueConstraint("user_id", "entry_date", name="uq_mood_entry_user_date"),)

	id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
	user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
	mood: Mapped[int] = mapped_column(Integer, nullable=False)
	stress_level: Mapped[int] = mapped_column(Integer, nullable=False)
	energy_level: Mapped[int] = mapped_column(Integer, nullable=False)
	entry_date: Mapped[date] = mapped_column(Date, nullable=False)
	notes: Mapped[str | None] = mapped_column(Text, nullable=True)
	created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
	updated_at: Mapped[datetime] = mapped_column(
		DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
	)
