# Mood Tracker Backend

This backend provides the mood, journal, analytics, activity, and AI insight APIs for the Mood Tracker application.

## Quick start

1. Copy `.env.example` to `.env` and configure your values.
2. Create a virtual environment and install dependencies.
3. Run database migrations with Alembic.
4. Start the application with Uvicorn.

## Environment variables

- `APP_ENV`: development, test, testing, or production
- `DATABASE_URL`: database connection string
- `SECRET_KEY`: JWT signing secret, required in production
- `CORS_ORIGINS`: comma-separated allowed frontend origins
- `AI_API_KEY`: optional API key for an external AI provider
- `AI_MODEL`: model name to use when calling the AI provider
- `AI_TIMEOUT_SECONDS`: external provider timeout
- `AI_MAX_TOKENS`: max tokens for AI completion requests
- `AI_COOLDOWN_SECONDS`: per-user cooldown for insight generation

## Running migrations

```bash
cd backend
python -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
alembic upgrade head
```

## Running tests

```bash
cd backend
. .venv/bin/activate
pytest -q
```

## AI insights disclaimer

AI-generated insights are informational support tools and are not medical advice or a diagnosis. They should be interpreted as gentle reflection prompts based on aggregated mood tracking data.
