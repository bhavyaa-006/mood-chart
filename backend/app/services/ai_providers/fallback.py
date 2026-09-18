from __future__ import annotations

from typing import Any

from app.services.ai_providers.base import AIProvider


class DeterministicFallbackProvider(AIProvider):
    """Produces supportive, deterministic insight text from summary analytics."""

    def generate(self, request: dict[str, Any]) -> dict[str, Any]:
        analytics = request.get("analytics", {})
        entries = request.get("entries", [])
        median_entry_count = analytics.get("entry_count", 0)
        average_mood = analytics.get("average_mood")
        mood_trend = analytics.get("mood_trend", 0)
        consistency = analytics.get("logging_consistency", 0)
        stress_level = analytics.get("average_stress")
        energy_level = analytics.get("average_energy")

        if median_entry_count == 0 or not entries:
            summary = (
                "You are in the early stages of tracking your wellbeing. "
                "A few more check-ins could help reveal patterns in how your mood shifts over time. "
                "This is informational guidance, not a diagnosis."
            )
            recommendations = [
                "Keep logging mood and energy for a few more days.",
                "Try a short reflection after your most calm or busiest moments.",
                "Focus on small routines that feel sustainable.",
            ]
            supporting_metrics = {
                "entry_count": 0,
                "average_mood": None,
                "logging_consistency": 0.0,
                "mood_trend": 0,
            }
            title = "Early tracking snapshot"
        else:
            if average_mood is None:
                average_mood = 0
            if mood_trend > 0:
                trend_text = "Your recent entries suggest a gentle upward shift in mood."
            elif mood_trend < 0:
                trend_text = "Your recent entries suggest a slight dip in mood, and it may help to slow down and notice what supports you."
            else:
                trend_text = "Your recent entries look fairly steady, which can be a good sign for noticing patterns."
            summary = (
                f"{trend_text} Based on {median_entry_count} recent check-ins, your average mood is {average_mood:.1f} out of 5, "
                f"with average stress at {stress_level:.1f} and average energy at {energy_level:.1f}. "
                "These patterns are informational and may help you notice habits, routines, or stressors worth supporting."
            )
            recommendations = [
                "Keep your check-ins consistent to spot the patterns that matter most to you.",
                "Notice which activities seem to support your energy or calm.",
                "Choose one small routine that feels manageable on low-energy days.",
            ]
            if consistency < 50:
                recommendations.append("Try a brief daily check-in at a consistent time to build a steadier rhythm.")
            supporting_metrics = {
                "entry_count": median_entry_count,
                "average_mood": round(float(average_mood), 2),
                "average_stress": round(float(stress_level), 2) if stress_level is not None else None,
                "average_energy": round(float(energy_level), 2) if energy_level is not None else None,
                "logging_consistency": round(float(consistency), 2),
                "mood_trend": int(mood_trend),
            }
            title = "Mood pattern snapshot"

        return {
            "title": title,
            "summary": summary,
            "recommendations": recommendations,
            "supporting_metrics": supporting_metrics,
            "model_name": "deterministic-fallback",
            "status": "fallback",
            "disclaimer": "This is informational guidance based on your recent tracking, not a diagnosis or medical advice.",
        }
