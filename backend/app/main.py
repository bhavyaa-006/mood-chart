from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.api.routes.achievements import router as achievements_router
from app.api.routes.activities import router as activities_router
from app.api.routes.ai_insights import router as ai_router
from app.api.routes.analytics import router as analytics_router
from app.api.routes.auth import router as auth_router
from app.api.routes.journal import router as journal_router
from app.api.routes.moods import router as moods_router
from app.api.routes.notifications import router as notifications_router
from app.api.routes.profile import router as profile_router
from app.api.routes.streaks import router as streaks_router
from app.core.config import get_settings
from app.db.database import engine

settings = get_settings()
app = FastAPI(title=settings.app_name)
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(moods_router)
app.include_router(notifications_router)
app.include_router(journal_router)
app.include_router(analytics_router)
app.include_router(streaks_router)
app.include_router(achievements_router)
app.include_router(activities_router)
app.include_router(ai_router)

app.add_middleware(
	CORSMiddleware,
	allow_origins=settings.cors_origin_list,
	allow_credentials=True,
	allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
	allow_headers=["Authorization", "Content-Type"],
)


@app.exception_handler(SQLAlchemyError)
async def database_error_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
	return JSONResponse(status_code=503, content={"detail": "Database unavailable"})


@app.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
	try:
		with engine.connect() as connection:
			connection.execute(text("SELECT 1"))
		return {"status": "ok", "database": "ok"}
	except SQLAlchemyError:
		return {"status": "degraded", "database": "unavailable"}


@app.get("/ready", tags=["system"])
def readiness_check() -> dict[str, str]:
	try:
		with engine.connect() as connection:
			connection.execute(text("SELECT 1"))
		return {"status": "ready", "database": "ok"}
	except SQLAlchemyError:
		raise JSONResponse(status_code=503, content={"status": "not_ready", "database": "unavailable"})
