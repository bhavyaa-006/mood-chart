from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.mood import MoodEntry
from app.models.user import User
from app.schemas.mood import MoodCreate, MoodUpdate


def create_mood_entry(db: Session, user: User, entry_data: MoodCreate) -> MoodEntry:
	entry = MoodEntry(user_id=user.id, **entry_data.model_dump())
	db.add(entry)
	db.commit()
	db.refresh(entry)
	return entry


def list_mood_entries(db: Session, user: User) -> list[MoodEntry]:
	return list(db.scalars(select(MoodEntry).where(MoodEntry.user_id == user.id).order_by(MoodEntry.entry_date.desc())))


def get_mood_entry(db: Session, user: User, entry_id: str) -> MoodEntry | None:
	return db.scalar(select(MoodEntry).where(MoodEntry.id == entry_id, MoodEntry.user_id == user.id))


def update_mood_entry(db: Session, entry: MoodEntry, entry_data: MoodUpdate) -> MoodEntry:
	for field, value in entry_data.model_dump(exclude_unset=True).items():
		setattr(entry, field, value)
	db.commit()
	db.refresh(entry)
	return entry


def delete_mood_entry(db: Session, entry: MoodEntry) -> None:
	db.delete(entry)
	db.commit()
