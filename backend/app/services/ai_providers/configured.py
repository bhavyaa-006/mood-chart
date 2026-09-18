from __future__ import annotations

import json
from typing import Any

import httpx

from app.core.config import get_settings
from app.services.ai_providers.base import AIProvider, AIProviderError


class ConfiguredAIProvider(AIProvider):
    """Calls the configured external AI provider if an API key is configured."""

    def generate(self, request: dict[str, Any]) -> dict[str, Any]:
        settings = get_settings()
        if not settings.ai_api_key:
            raise AIProviderError("AI API key is not configured")

        payload = {
            "model": settings.ai_model,
            "input": {
                "system": (
                    "You are a supportive wellbeing companion. Provide gentle guidance based only on aggregated mood metrics. "
                    "Do not diagnose, do not claim medical certainty, and do not encourage unsafe actions. "
                    "Use cautious wording like may, could, or you might notice, and include a clear informational disclaimer."
                ),
                "user": json.dumps({
                    "days": request.get("days", 14),
                    "insight_type": request.get("insight_type", "mood_summary"),
                    "metrics": request.get("analytics", {}),
                    "trend_summary": request.get("trend_summary", ""),
                }, separators=(",", ":")),
            },
            "max_tokens": settings.ai_max_tokens,
        }
        headers = {
            "Authorization": f"Bearer {settings.ai_api_key}",
            "Content-Type": "application/json",
        }
        response = httpx.post(
            settings.ai_base_url or "https://api.openai.com/v1/responses",
            headers=headers,
            json=payload,
            timeout=settings.ai_timeout_seconds,
        )
        response.raise_for_status()
        data = response.json()

        text = None
        if isinstance(data.get("output"), list):
            for item in data["output"]:
                if isinstance(item, dict):
                    content = item.get("content") or []
                    for part in content:
                        if isinstance(part, dict):
                            text = part.get("text")
                            if text:
                                break
                    if text:
                        break
        elif isinstance(data.get("choices"), list):
            message = data["choices"][0].get("message", {})
            text = message.get("content")

        if not text or not isinstance(text, str):
            raise AIProviderError("AI provider returned malformed content")

        return {
            "title": "AI-supported reflection",
            "summary": text.strip(),
            "recommendations": [
                "Keep a consistent rhythm of daily check-ins.",
                "Notice which activities support your energy and calm.",
                "Use these reflections as gentle self-awareness prompts.",
            ],
            "supporting_metrics": request.get("analytics", {}).get("supporting_metrics", {}),
            "model_name": settings.ai_model,
            "status": "generated",
            "disclaimer": "This is informational guidance based on your recent tracking, not a diagnosis or medical advice.",
        }
