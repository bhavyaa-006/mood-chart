from datetime import datetime
from enum import Enum
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from pydantic import BaseModel, ConfigDict, Field, field_validator


class PracticeCategory(str, Enum):
	stress_management = "stress_management"
	relaxation = "relaxation"
	focus = "focus"
	mindfulness = "mindfulness"
	breathing = "breathing"
	emotional_awareness = "emotional_awareness"
	sleep_habits = "sleep_habits"
	self_reflection = "self_reflection"
	cognitive_exercises = "cognitive_exercises"


class ProfileUpdate(BaseModel):
	display_name: str | None = Field(default=None, max_length=100)
	timezone: str | None = Field(default=None, max_length=64)

	@field_validator("timezone")
	@classmethod
	def validate_timezone(cls, value: str | None) -> str | None:
		if value is None:
			return value
		try:
			ZoneInfo(value)
		except ZoneInfoNotFoundError as exc:
			raise ValueError("timezone must be a valid IANA timezone") from exc
		return value


class GoalCreate(BaseModel):
	category: PracticeCategory


class GoalRead(BaseModel):
	model_config = ConfigDict(from_attributes=True)

	id: str
	category: PracticeCategory
	created_at: datetime


class OnboardingRequest(ProfileUpdate):
	goals: list[PracticeCategory] = Field(min_length=1, max_length=9)

	@field_validator("goals")
	@classmethod
	def validate_unique_goals(cls, value: list[PracticeCategory]) -> list[PracticeCategory]:
		if len(value) != len(set(value)):
			raise ValueError("goals must not contain duplicates")
		return value


class ProfileRead(BaseModel):
	model_config = ConfigDict(from_attributes=True)

	id: str
	user_id: str
	display_name: str | None
	timezone: str
	onboarding_completed: bool
	created_at: datetime
	updated_at: datetime
	goals: list[GoalRead]
