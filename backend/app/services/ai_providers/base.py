from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class AIProviderError(RuntimeError):
    """Raised when the configured AI provider fails or returns malformed output."""


class AIProvider(ABC):
    """Abstract interface for generating insight payloads."""

    @abstractmethod
    def generate(self, request: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError
