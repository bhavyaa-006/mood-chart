from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine
from app.api.mood import router as mood_router
from app.api.auth import router as auth_router
from app.api.wellness import router as wellness_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mood Chart API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(mood_router)
app.include_router(wellness_router)


@app.get("/")
def root():
    return {"message": "Mood Chart API"}