from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.journal import JournalCreate, JournalRead, JournalUpdate
from app.services.journal_service import (
	create_journal_entry,
	delete_journal_entry,
	get_journal_entry,
	list_journal_entries,
	update_journal_entry,
)

router = APIRouter(prefix="/api/journal", tags=["journal"])


@router.post("", response_model=JournalRead, status_code=status.HTTP_201_CREATED)
def create_journal(
	entry_data: JournalCreate,
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
) -> JournalRead:
	return create_journal_entry(db, current_user, entry_data)


@router.get("", response_model=list[JournalRead])
def list_journal(
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
) -> list[JournalRead]:
	return list_journal_entries(db, current_user)


@router.get("/{entry_id}", response_model=JournalRead)
def get_journal(
	entry_id: str,
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
) -> JournalRead:
	entry = get_journal_entry(db, current_user, entry_id)
	if entry is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journal entry not found")
	return entry


@router.patch("/{entry_id}", response_model=JournalRead)
def patch_journal(
	entry_id: str,
	entry_data: JournalUpdate,
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
) -> JournalRead:
	entry = get_journal_entry(db, current_user, entry_id)
	if entry is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journal entry not found")
	return update_journal_entry(db, entry, entry_data)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_journal(
	entry_id: str,
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
) -> None:
	entry = get_journal_entry(db, current_user, entry_id)
	if entry is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journal entry not found")
	delete_journal_entry(db, entry)
