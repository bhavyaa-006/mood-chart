from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.analytics import (
	AnalyticsSummary,
	CalendarPoint,
	CorrelationResponse,
	TrendPoint,
)
from app.services.analytics_service import (
	build_calendar,
	build_correlations,
	build_summary,
	build_trend,
)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


def date_range(
	start_date: date | None,
	end_date: date | None,
) -> tuple[date | None, date | None]:
	if start_date and end_date and start_date > end_date:
		raise HTTPException(
		status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
		detail="start_date must be before or equal to end_date",
	)
	return start_date, end_date


@router.get("/summary", response_model=AnalyticsSummary)
def summary(
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
	start_date: date | None = None,
	end_date: date | None = None,
) -> AnalyticsSummary:
	start_date, end_date = date_range(start_date, end_date)
	return build_summary(db, current_user, start_date, end_date)


@router.get("/mood-trends", response_model=list[TrendPoint])
def mood_trends(
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
	start_date: date | None = None,
	end_date: date | None = None,
) -> list[TrendPoint]:
	start_date, end_date = date_range(start_date, end_date)
	return build_trend(db, current_user, "mood", start_date, end_date)


@router.get("/stress-trends", response_model=list[TrendPoint])
def stress_trends(
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
	start_date: date | None = None,
	end_date: date | None = None,
) -> list[TrendPoint]:
	start_date, end_date = date_range(start_date, end_date)
	return build_trend(db, current_user, "stress_level", start_date, end_date)


@router.get("/calendar", response_model=list[CalendarPoint])
def calendar(
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
	start_date: date | None = None,
	end_date: date | None = None,
) -> list[CalendarPoint]:
	start_date, end_date = date_range(start_date, end_date)
	return build_calendar(db, current_user, start_date, end_date)


@router.get("/correlations", response_model=CorrelationResponse)
def correlations(
	current_user: User = Depends(get_current_user),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
	start_date: date | None = None,
	end_date: date | None = None,
) -> CorrelationResponse:
	start_date, end_date = date_range(start_date, end_date)
	return build_correlations(db, current_user, start_date, end_date)
