from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    MeResponse,
    ResetPasswordRequest,
    SignupRequest,
    TokenResponse,
)
from app.services import auth_service
from app.core.security import decode_access_token
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Auth"])

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    token = credentials.credentials
    try:
        payload = decode_access_token(token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")

    user = auth_service.get_user_by_id(db, int(user_id))
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")

    return user


@router.post("/signup", response_model=MeResponse)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    user = auth_service.signup(db, payload.name, payload.email, payload.password)
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    access_token = auth_service.login(db, payload.email, payload.password)
    return TokenResponse(access_token=access_token)


@router.post("/logout")
def logout():
    # Client-side token discard for now.
    return {"ok": True}


@router.get("/me", response_model=MeResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


# Password reset scaffolding (returns 501 for now).
@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest):
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Password reset not implemented yet.")


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest):
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Password reset not implemented yet.")
