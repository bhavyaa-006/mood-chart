from enum import Enum


class MoodScale(str, Enum):
    VERY_BAD = "very_bad"
    BAD = "bad"
    NEUTRAL = "neutral"
    GOOD = "good"
    EXCELLENT = "excellent"


MOOD_METADATA = {
    "very_bad": {"label": "Very Bad", "emoji": "😞", "score": 1},
    "bad": {"label": "Bad", "emoji": "🙁", "score": 2},
    "neutral": {"label": "Neutral", "emoji": "😐", "score": 3},
    "good": {"label": "Good", "emoji": "🙂", "score": 4},
    "excellent": {"label": "Excellent", "emoji": "😄", "score": 5},
}