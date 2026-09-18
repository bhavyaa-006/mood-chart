from datetime import datetime
from uuid import uuid4

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base
from app.models.user import utc_now


class Activity(Base):
	__tablename__ = "activities"

	id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
	name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
	description: Mapped[str] = mapped_column(Text, nullable=False)
	category: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
	difficulty: Mapped[str] = mapped_column(String(32), nullable=False)
	is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
	created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class ActivitySession(Base):
	__tablename__ = "activity_sessions"

	id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
	user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
	activity_id: Mapped[str] = mapped_column(ForeignKey("activities.id", ondelete="CASCADE"), index=True, nullable=False)
	started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
	completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
	score: Mapped[int | None] = mapped_column(Integer, nullable=True)
	metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
