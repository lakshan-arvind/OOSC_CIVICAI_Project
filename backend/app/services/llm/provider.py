from abc import ABC, abstractmethod
import json
import logging
import re
from typing import Any, Optional

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class LLMProvider(ABC):
    @abstractmethod
    async def generate(
        self,
        prompt: str,
        *,
        system: Optional[str] = None,
        temperature: float = 0.2,
        json_mode: bool = False,
    ) -> str:
        raise NotImplementedError

    @abstractmethod
    async def health(self) -> str:
        raise NotImplementedError


class OllamaProvider(LLMProvider):
    def __init__(self) -> None:
        self.settings = get_settings()
        self.base_url = self.settings.ollama_base_url.rstrip("/")
        self.model = self.settings.ollama_model

    async def health(self) -> str:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                r = await client.get(f"{self.base_url}/api/tags")
                if r.status_code == 200:
                    return "ok"
                return f"error:{r.status_code}"
        except Exception as exc:  # noqa: BLE001
            return f"unavailable:{exc.__class__.__name__}"

    async def generate(
        self,
        prompt: str,
        *,
        system: Optional[str] = None,
        temperature: float = 0.2,
        json_mode: bool = False,
    ) -> str:
        messages: list[dict[str, str]] = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        payload: dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "options": {"temperature": temperature},
        }
        if json_mode:
            payload["format"] = "json"

        try:
            async with httpx.AsyncClient(timeout=self.settings.ollama_timeout_seconds) as client:
                r = await client.post(f"{self.base_url}/api/chat", json=payload)
                r.raise_for_status()
                data = r.json()
                return (data.get("message") or {}).get("content") or ""
        except Exception as exc:  # noqa: BLE001
            logger.warning("Ollama generate failed: %s", exc)
            raise RuntimeError(
                "CivicAI could not reach the language model service. Please try again."
            ) from exc


class FallbackLLMProvider(LLMProvider):
    """Deterministic structured helpers when Ollama is offline."""

    async def health(self) -> str:
        return "fallback"

    async def generate(
        self,
        prompt: str,
        *,
        system: Optional[str] = None,
        temperature: float = 0.2,
        json_mode: bool = False,
    ) -> str:
        lower = prompt.lower()
        if json_mode or "json" in (system or "").lower() or "return json" in lower:
            return self._json_response(prompt, lower)
        return (
            "I couldn't reach the language model right now. "
            "Using grounded civic guidance from verified sources instead."
        )

    def _json_response(self, prompt: str, lower: str) -> str:
        if "classify" in lower or "intent" in lower:
            domain = "rti" if "rti" in lower else "grievance"
            if any(w in lower for w in ("drainage", "garbage", "road", "streetlight", "water", "municip")):
                domain = "grievance"
            return json.dumps(
                {
                    "domain": domain,
                    "intent": "file_rti" if domain == "rti" else "municipal_grievance",
                    "language": "hi" if re.search(r"[\u0900-\u097F]", prompt) else "en",
                    "confidence": "heuristic",
                }
            )
        if "extract" in lower and "fact" in lower:
            facts: dict[str, Any] = {"issue_type": None, "has_prior_complaint": None}
            if "drainage" in lower:
                facts["issue_type"] = "drainage"
            if "garbage" in lower:
                facts["issue_type"] = "garbage"
            if "rti" in lower:
                facts["issue_type"] = "rti_request"
            if any(w in lower for w in ("several", "multiple", "again", "despite")):
                facts["has_prior_complaint"] = True
            return json.dumps({"facts": facts})
        if "missing" in lower or "clarif" in lower:
            needs_location = not any(
                c in lower
                for c in (
                    "chennai",
                    "mumbai",
                    "delhi",
                    "bengaluru",
                    "bangalore",
                    "hyderabad",
                    "tamil nadu",
                    "maharashtra",
                    "karnataka",
                )
            )
            if needs_location:
                return json.dumps(
                    {
                        "missing": ["state", "city"],
                        "question": "Which city and state is this issue about?",
                    }
                )
            return json.dumps({"missing": [], "question": None})
        return json.dumps({"ok": True})


_provider: Optional[LLMProvider] = None


async def get_llm() -> LLMProvider:
    global _provider
    if _provider is not None:
        return _provider

    ollama = OllamaProvider()
    status = await ollama.health()
    if status == "ok":
        _provider = ollama
        logger.info("Using OllamaProvider (%s)", ollama.model)
    else:
        _provider = FallbackLLMProvider()
        logger.warning("Ollama unavailable (%s); using FallbackLLMProvider", status)
    return _provider


def reset_llm_provider() -> None:
    global _provider
    _provider = None
