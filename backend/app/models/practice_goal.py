from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base
from app.models.user import utc_now


class PracticeGoal(Base):
	__tablename__ = "practice_goals"
	__table_args__ = (UniqueConstraint("user_id", "category", name="uq_practice_goal_user_category"),)

	id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
	user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
	category: Mapped[str] = mapped_column(String(64), nullable=False)
	created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
