from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.notification import (
	NotificationPreferenceRead,
	NotificationPreferenceUpdate,
)
from app.services.notification_service import (
	get_or_create_preferences,
	update_preferences,
)

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("/preferences", response_model=NotificationPreferenceRead)
def get_preferences(
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
) -> NotificationPreferenceRead:
	return get_or_create_preferences(db, current_user)


@router.patch("/preferences", response_model=NotificationPreferenceRead)
def patch_preferences(
	preference_data: NotificationPreferenceUpdate,
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
) -> NotificationPreferenceRead:
	return update_preferences(db, current_user, preference_data)
