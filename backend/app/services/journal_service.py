from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.journal import JournalEntry
from app.models.user import User
from app.schemas.journal import JournalCreate, JournalUpdate


def create_journal_entry(db: Session, user: User, entry_data: JournalCreate) -> JournalEntry:
	entry = JournalEntry(user_id=user.id, **entry_data.model_dump())
	db.add(entry)
	db.commit()
	db.refresh(entry)
	return entry


def list_journal_entries(db: Session, user: User) -> list[JournalEntry]:
	return list(
		db.scalars(
			select(JournalEntry)
			.where(JournalEntry.user_id == user.id)
			.order_by(JournalEntry.entry_date.desc(), JournalEntry.created_at.desc())
		)
	)


def get_journal_entry(db: Session, user: User, entry_id: str) -> JournalEntry | None:
	return db.scalar(select(JournalEntry).where(JournalEntry.id == entry_id, JournalEntry.user_id == user.id))


def update_journal_entry(
	db: Session, entry: JournalEntry, entry_data: JournalUpdate
) -> JournalEntry:
	for field, value in entry_data.model_dump(exclude_unset=True).items():
		setattr(entry, field, value)
	db.commit()
	db.refresh(entry)
	return entry


def delete_journal_entry(db: Session, entry: JournalEntry) -> None:
	db.delete(entry)
	db.commit()
