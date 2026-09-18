from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class JournalCreate(BaseModel):
	content: str = Field(min_length=1, max_length=10000)
	entry_date: date


class JournalUpdate(BaseModel):
	content: str | None = Field(default=None, min_length=1, max_length=10000)
	entry_date: date | None = None


class JournalRead(BaseModel):
	model_config = ConfigDict(from_attributes=True)

	id: str
	user_id: str
	content: str
	entry_date: date
	created_at: datetime
	updated_at: datetime
