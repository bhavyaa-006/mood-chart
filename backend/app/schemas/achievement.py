from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AchievementRead(BaseModel):
	model_config = ConfigDict(from_attributes=True)

	id: str
	name: str
	description: str
	requirement_type: str
	requirement_value: int
	unlocked_at: datetime | None = None
