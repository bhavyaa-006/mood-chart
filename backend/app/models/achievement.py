from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base
from app.models.user import utc_now


class Achievement(Base):
	__tablename__ = "achievements"

	id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
	name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
	description: Mapped[str] = mapped_column(String(500), nullable=False)
	requirement_type: Mapped[str] = mapped_column(String(64), nullable=False)
	requirement_value: Mapped[int] = mapped_column(Integer, nullable=False)


class UserAchievement(Base):
	__tablename__ = "user_achievements"
	__table_args__ = (UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement"),)

	id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
	user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
	achievement_id: Mapped[str] = mapped_column(ForeignKey("achievements.id", ondelete="CASCADE"), index=True, nullable=False)
	unlocked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
