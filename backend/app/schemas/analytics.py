from datetime import date

from pydantic import BaseModel, Field, model_validator


class AnalyticsRange(BaseModel):
	start_date: date | None = None
	end_date: date | None = None

	@model_validator(mode="after")
	def validate_range(self) -> "AnalyticsRange":
		if self.start_date and self.end_date and self.start_date > self.end_date:
			raise ValueError("start_date must be before or equal to end_date")
		return self


class AnalyticsAverages(BaseModel):
	mood: float
	stress_level: float
	energy_level: float


class PeriodAverage(BaseModel):
	period: str
	mood: float
	stress_level: float
	energy_level: float


class AnalyticsSummary(BaseModel):
	entry_count: int
	averages: AnalyticsAverages | None
	mood_distribution: dict[str, int]
	weekly_averages: list[PeriodAverage]
	monthly_averages: list[PeriodAverage]
	logging_consistency: float = Field(ge=0, le=100)


class TrendPoint(BaseModel):
	entry_date: date
	value: int


class CalendarPoint(BaseModel):
	entry_date: date
	mood: int
	stress_level: int
	energy_level: int


class CorrelationResponse(BaseModel):
	mood_stress: float | None
	mood_energy: float | None
	stress_energy: float | None
