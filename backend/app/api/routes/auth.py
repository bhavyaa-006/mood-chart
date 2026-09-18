import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import create_access_token, decode_access_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import (
	ForgotPasswordRequest,
	RefreshTokenRequest,
	ResetPasswordRequest,
	Token,
	UserCreate,
	UserRead,
)
from app.services.auth_service import (
	authenticate_user,
	create_password_reset_token,
	create_refresh_token,
	get_user_by_email,
	register_user,
	reset_password,
	revoke_refresh_token,
	rotate_refresh_token,
)

router = APIRouter(prefix="/api/auth", tags=["authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
	token: str = Depends(oauth2_scheme),
	db: Session = Depends(get_db),  # noqa: B008
) -> User:
	credentials_exception = HTTPException(
		status_code=status.HTTP_401_UNAUTHORIZED,
		detail="Could not validate credentials",
		headers={"WWW-Authenticate": "Bearer"},
	)
	try:
		payload = decode_access_token(token)
		user_id = payload["sub"]
	except (jwt.InvalidTokenError, KeyError):
		raise credentials_exception from None

	user = db.scalar(select(User).where(User.id == user_id, User.is_active.is_(True)))
	if user is None:
		raise credentials_exception
	return user


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)) -> User:  # noqa: B008
	try:
		return register_user(db, user_data)
	except IntegrityError:
		db.rollback()
		raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered") from None


@router.post("/login", response_model=Token)
def login(
	form_data: OAuth2PasswordRequestForm = Depends(),  # noqa: B008
	db: Session = Depends(get_db),  # noqa: B008
) -> Token:
	user = authenticate_user(db, form_data.username, form_data.password)
	if user is None:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Incorrect email or password",
			headers={"WWW-Authenticate": "Bearer"},
		)
	return Token(
		access_token=create_access_token(user.id),
		refresh_token=create_refresh_token(db, user),
		token_type="bearer",
	)


@router.post("/refresh", response_model=Token)
def refresh(request: RefreshTokenRequest, db: Session = Depends(get_db)) -> Token:  # noqa: B008
	result = rotate_refresh_token(db, request.refresh_token)
	if result is None:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
	user, refresh_token = result
	return Token(
		access_token=create_access_token(user.id),
		refresh_token=refresh_token,
		token_type="bearer",
	)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(request: RefreshTokenRequest, db: Session = Depends(get_db)) -> None:  # noqa: B008
	revoke_refresh_token(db, request.refresh_token)


@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)) -> dict[str, str]:  # noqa: B008
	user = get_user_by_email(db, str(request.email))
	if user is not None and user.is_active:
		create_password_reset_token(db, user)
	return {"message": "If the account exists, password reset instructions will be sent."}


@router.post("/reset-password")
def reset(request: ResetPasswordRequest, db: Session = Depends(get_db)) -> dict[str, str]:  # noqa: B008
	if not reset_password(db, request.token, request.password):
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")
	return {"message": "Password reset successfully"}


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)) -> User:  # noqa: B008
	return current_user
