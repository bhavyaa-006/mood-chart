from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.activity import (
	ActivityRead,
	ActivitySessionComplete,
	ActivitySessionCreate,
	ActivitySessionRead,
)
from app.services.activity_service import (
	complete_session,
	create_session,
	get_activity,
	get_session,
	list_activities,
	list_sessions,
)

router = APIRouter(prefix="/api/activities", tags=["activities"])


def serialize_session(item) -> ActivitySessionRead:
	return ActivitySessionRead(
		id=item.id,
		user_id=item.user_id,
		activity_id=item.activity_id,
		started_at=item.started_at,
		completed_at=item.completed_at,
		score=item.score,
		metadata=item.metadata_json,
	)


@router.get("", response_model=list[ActivityRead])
def activities(
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
) -> list[ActivityRead]:
	return list_activities(db)


@router.post("/{activity_id}/sessions", response_model=ActivitySessionRead, status_code=status.HTTP_201_CREATED)
def start_session(
	activity_id: str,
	session_data: ActivitySessionCreate,
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
) -> ActivitySessionRead:
	item = get_activity(db, activity_id)
	if item is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
	return serialize_session(create_session(db, current_user, item, session_data))


@router.post("/sessions/{session_id}/complete", response_model=ActivitySessionRead)
def finish_session(
	session_id: str,
	completion: ActivitySessionComplete,
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
) -> ActivitySessionRead:
	item = get_session(db, current_user, session_id)
	if item is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity session not found")
	return serialize_session(complete_session(db, item, completion))


@router.get("/sessions", response_model=list[ActivitySessionRead])
def sessions(
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
) -> list[ActivitySessionRead]:
	return [serialize_session(item) for item in list_sessions(db, current_user)]


@router.get("/{activity_id}", response_model=ActivityRead)
def activity(
	activity_id: str,
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
) -> ActivityRead:
	item = get_activity(db, activity_id)
	if item is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
	return item
