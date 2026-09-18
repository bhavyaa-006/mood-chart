from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.db.session import get_db
from app.models.ai_insight import AIInsight
from app.models.user import User
from app.schemas.ai_insight import (
    AIInsightGenerateRequest,
    AIInsightListResponse,
    AIInsightRead,
)
from app.services.ai_service import (
    RateLimitError,
    generate_insight_for_user,
    list_insights_for_user,
)

router = APIRouter(prefix="/api/ai-insights", tags=["ai-insights"])


@router.post("/generate", response_model=AIInsightRead, status_code=status.HTTP_200_OK)
def generate_insight(
    request: AIInsightGenerateRequest,
    current_user: User = Depends(get_current_user),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
) -> AIInsightRead:
    try:
        insight = generate_insight_for_user(db, current_user, days=request.days, insight_type=request.insight_type)
    except RateLimitError as exc:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(exc)) from exc
    return insight


@router.get("", response_model=AIInsightListResponse)
def list_insights(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
) -> AIInsightListResponse:
    items, total = list_insights_for_user(db, current_user, limit=limit, offset=offset)
    return AIInsightListResponse(items=list(items), total=total, limit=limit, offset=offset)


@router.get("/{insight_id}", response_model=AIInsightRead)
def get_insight(
    insight_id: str,
    current_user: User = Depends(get_current_user),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
) -> AIInsightRead:
    insight = db.get(AIInsight, insight_id)
    if insight is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Insight not found")
    if insight.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to access this insight")
    return insight


@router.delete("/{insight_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_insight(
    insight_id: str,
    current_user: User = Depends(get_current_user),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
) -> None:
    insight = db.get(AIInsight, insight_id)
    if insight is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Insight not found")
    if insight.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to delete this insight")
    db.delete(insight)
    db.commit()
