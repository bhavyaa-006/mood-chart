from datetime import datetime
from typing import Any

from pydantic import AliasChoices, BaseModel, ConfigDict, Field


class ActivityRead(BaseModel):
	model_config = ConfigDict(from_attributes=True)

	id: str
	name: str
	description: str
	category: str
	difficulty: str
	is_active: bool
	created_at: datetime


class ActivitySessionCreate(BaseModel):
	started_at: datetime | None = None
	score: int | None = Field(default=None, ge=0, le=100)
	metadata: dict[str, Any] | None = None


class ActivitySessionComplete(BaseModel):
	score: int | None = Field(default=None, ge=0, le=100)
	metadata: dict[str, Any] | None = None


class ActivitySessionRead(BaseModel):
	model_config = ConfigDict(from_attributes=True)

	id: str
	user_id: str
	activity_id: str
	started_at: datetime
	completed_at: datetime | None
	score: int | None
	metadata: dict[str, Any] | None = Field(
		default=None,
		validation_alias=AliasChoices("metadata", "metadata_json"),
	)
