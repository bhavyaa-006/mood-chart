from datetime import datetime, time
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Time
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base
from app.models.user import utc_now


class NotificationPreference(Base):
	__tablename__ = "notification_preferences"

	id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
	user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
	enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
	reminder_time: Mapped[time] = mapped_column(Time(), default=time(20, 0), nullable=False)
	timezone: Mapped[str] = mapped_column(String(64), default="UTC", nullable=False)
	created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
	updated_at: Mapped[datetime] = mapped_column(
		DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
	)
