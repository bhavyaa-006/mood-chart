from datetime import datetime, timedelta, timezone
from uuid import uuid4

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import (
	create_opaque_token,
	hash_opaque_token,
	hash_password,
	verify_password,
)
from app.models.auth_token import PasswordResetToken, RefreshToken
from app.models.user import User
from app.schemas.user import UserCreate


def is_expired(expires_at: datetime, now: datetime) -> bool:
	if expires_at.tzinfo is None:
		expires_at = expires_at.replace(tzinfo=timezone.utc)
	return expires_at <= now


def get_user_by_email(db: Session, email: str) -> User | None:
	return db.scalar(select(User).where(User.email == email.lower()))


def register_user(db: Session, user_data: UserCreate) -> User:
	user = User(email=str(user_data.email).lower(), hashed_password=hash_password(user_data.password))
	db.add(user)
	db.commit()
	db.refresh(user)
	return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
	user = get_user_by_email(db, email)
	if user is None or not user.is_active or not verify_password(password, user.hashed_password):
		return None
	return user


def create_refresh_token(db: Session, user: User) -> str:
	raw_token = create_opaque_token()
	token = RefreshToken(
		id=str(uuid4()),
		user_id=user.id,
		token_hash=hash_opaque_token(raw_token),
		expires_at=datetime.now(timezone.utc) + timedelta(days=get_settings().refresh_token_expire_days),
	)
	db.add(token)
	db.commit()
	return raw_token


def rotate_refresh_token(db: Session, raw_token: str) -> tuple[User, str] | None:
	token = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == hash_opaque_token(raw_token)))
	now = datetime.now(timezone.utc)
	if token is None or token.revoked_at is not None or is_expired(token.expires_at, now):
		return None

	user = db.get(User, token.user_id)
	if user is None or not user.is_active:
		return None

	token.revoked_at = now
	new_token = create_refresh_token(db, user)
	return user, new_token


def revoke_refresh_token(db: Session, raw_token: str) -> None:
	token = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == hash_opaque_token(raw_token)))
	if token is not None and token.revoked_at is None:
		token.revoked_at = datetime.now(timezone.utc)
		db.commit()


def create_password_reset_token(db: Session, user: User) -> str:
	raw_token = create_opaque_token()
	token = PasswordResetToken(
		id=str(uuid4()),
		user_id=user.id,
		token_hash=hash_opaque_token(raw_token),
		expires_at=datetime.now(timezone.utc) + timedelta(minutes=get_settings().password_reset_expire_minutes),
	)
	db.add(token)
	db.commit()
	return raw_token


def reset_password(db: Session, raw_token: str, new_password: str) -> bool:
	token = db.scalar(select(PasswordResetToken).where(PasswordResetToken.token_hash == hash_opaque_token(raw_token)))
	now = datetime.now(timezone.utc)
	if token is None or token.used_at is not None or is_expired(token.expires_at, now):
		return False

	user = db.get(User, token.user_id)
	if user is None or not user.is_active:
		return False

	user.hashed_password = hash_password(new_password)
	token.used_at = now
	db.execute(
		update(RefreshToken)
		.where(RefreshToken.user_id == user.id, RefreshToken.revoked_at.is_(None))
		.values(revoked_at=now)
	)
	db.commit()
	return True
