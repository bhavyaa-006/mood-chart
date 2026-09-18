from datetime import datetime, timedelta, timezone
from hashlib import sha256
from secrets import token_urlsafe
from uuid import uuid4

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

from app.core.config import get_settings

password_hasher = PasswordHasher()


def hash_password(password: str) -> str:
	return password_hasher.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
	try:
		return password_hasher.verify(hashed_password, password)
	except (InvalidHashError, VerificationError, VerifyMismatchError):
		return False


def create_access_token(subject: str) -> str:
	now = datetime.now(timezone.utc)
	expires_at = now + timedelta(minutes=get_settings().access_token_expire_minutes)
	payload = {
		"sub": subject,
		"type": "access",
		"jti": str(uuid4()),
		"iat": now,
		"exp": expires_at,
	}
	return jwt.encode(payload, get_settings().secret_key, algorithm="HS256")


def create_opaque_token() -> str:
	return token_urlsafe(48)


def hash_opaque_token(token: str) -> str:
	return sha256(token.encode("utf-8")).hexdigest()


def decode_access_token(token: str) -> dict[str, object]:
	payload = jwt.decode(token, get_settings().secret_key, algorithms=["HS256"])
	if payload.get("type") != "access" or not isinstance(payload.get("sub"), str):
		raise jwt.InvalidTokenError("Invalid access token")
	return payload
