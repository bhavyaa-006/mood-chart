from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AIInsightGenerateRequest(BaseModel):
    days: int = Field(default=14, ge=1, le=365)
    insight_type: str = Field(default="mood_summary", min_length=2, max_length=64)


class AIInsightRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    insight_type: str
    title: str
    summary: str
    recommendations: list[str]
    supporting_metrics: dict[str, object]
    model_name: str
    status: str
    created_at: datetime
    updated_at: datetime
    expires_at: datetime | None = None


class AIInsightListResponse(BaseModel):
    items: list[AIInsightRead]
    total: int
    limit: int
    offset: int
