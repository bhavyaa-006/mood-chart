from sqlalchemy import Column, Date, DateTime, Integer, String
from sqlalchemy.sql import func

from app.db.database import Base


class Mood(Base):
    __tablename__ = "moods"

    id = Column(Integer, primary_key=True, index=True)

    mood = Column(String, nullable=False)

    note = Column(String, nullable=True)

    entry_date = Column(
        Date,
        nullable=False,
        unique=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )