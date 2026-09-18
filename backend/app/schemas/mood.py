from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class MoodCreate(BaseModel):
	mood: int = Field(ge=1, le=5)
	stress_level: int = Field(ge=1, le=5)
	energy_level: int = Field(ge=1, le=5)
	entry_date: date
	notes: str | None = Field(default=None, max_length=2000)


class MoodUpdate(BaseModel):
	mood: int | None = Field(default=None, ge=1, le=5)
	stress_level: int | None = Field(default=None, ge=1, le=5)
	energy_level: int | None = Field(default=None, ge=1, le=5)
	entry_date: date | None = None
	notes: str | None = Field(default=None, max_length=2000)


class MoodRead(BaseModel):
	model_config = ConfigDict(from_attributes=True)

	id: str
	user_id: str
	mood: int
	stress_level: int
	energy_level: int
	entry_date: date
	notes: str | None
	created_at: datetime
	updated_at: datetime
