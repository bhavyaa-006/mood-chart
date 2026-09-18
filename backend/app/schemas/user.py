from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
	email: EmailStr
	password: str = Field(min_length=12, max_length=128)


class UserRead(BaseModel):
	model_config = ConfigDict(from_attributes=True)

	id: str
	email: EmailStr
	is_active: bool
	is_verified: bool
	created_at: datetime


class Token(BaseModel):
	access_token: str
	refresh_token: str
	token_type: str


class RefreshTokenRequest(BaseModel):
	refresh_token: str = Field(min_length=20, max_length=512)


class ForgotPasswordRequest(BaseModel):
	email: EmailStr


class ResetPasswordRequest(BaseModel):
	token: str = Field(min_length=20, max_length=512)
	password: str = Field(min_length=12, max_length=128)
