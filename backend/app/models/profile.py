from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base
from app.models.user import utc_now


class Profile(Base):
	__tablename__ = "profiles"

	id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
	user_id: Mapped[str] = mapped_column(
		ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
	)
	display_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
	timezone: Mapped[str] = mapped_column(String(64), default="UTC", nullable=False)
	onboarding_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
	created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
	updated_at: Mapped[datetime] = mapped_column(
		DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
	)
