from datetime import datetime, time
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from pydantic import BaseModel, ConfigDict, Field, field_validator


def validate_timezone(value: str) -> str:
	try:
		ZoneInfo(value)
	except ZoneInfoNotFoundError as exc:
		raise ValueError("timezone must be a valid IANA timezone") from exc
	return value


class NotificationPreferenceUpdate(BaseModel):
	enabled: bool | None = None
	reminder_time: time | None = None
	timezone: str | None = Field(default=None, max_length=64)

	@field_validator("timezone")
	@classmethod
	def timezone_is_valid(cls, value: str | None) -> str | None:
		return validate_timezone(value) if value is not None else None


class NotificationPreferenceRead(BaseModel):
	model_config = ConfigDict(from_attributes=True)

	id: str
	user_id: str
	enabled: bool
	reminder_time: time
	timezone: str
	created_at: datetime
	updated_at: datetime
