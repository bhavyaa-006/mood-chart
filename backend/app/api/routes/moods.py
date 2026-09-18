from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.mood import MoodCreate, MoodRead, MoodUpdate
from app.services.mood_service import (
	create_mood_entry,
	delete_mood_entry,
	get_mood_entry,
	list_mood_entries,
	update_mood_entry,
)

router = APIRouter(prefix="/api/moods", tags=["moods"])


@router.post("", response_model=MoodRead, status_code=status.HTTP_201_CREATED)
def create_mood(
	entry_data: MoodCreate,
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
) -> MoodRead:
	try:
		return create_mood_entry(db, current_user, entry_data)
	except IntegrityError:
		db.rollback()
		raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A mood entry already exists for this date") from None


@router.get("", response_model=list[MoodRead])
def list_moods(
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
) -> list[MoodRead]:
	return list_mood_entries(db, current_user)


@router.get("/{mood_id}", response_model=MoodRead)
def get_mood(
	mood_id: str,
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
) -> MoodRead:
	entry = get_mood_entry(db, current_user, mood_id)
	if entry is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mood entry not found")
	return entry


@router.patch("/{mood_id}", response_model=MoodRead)
def patch_mood(
	mood_id: str,
	entry_data: MoodUpdate,
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
) -> MoodRead:
	entry = get_mood_entry(db, current_user, mood_id)
	if entry is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mood entry not found")
	try:
		return update_mood_entry(db, entry, entry_data)
	except IntegrityError:
		db.rollback()
		raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A mood entry already exists for this date") from None


@router.delete("/{mood_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_mood(
	mood_id: str,
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
) -> None:
	entry = get_mood_entry(db, current_user, mood_id)
	if entry is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mood entry not found")
	delete_mood_entry(db, entry)
