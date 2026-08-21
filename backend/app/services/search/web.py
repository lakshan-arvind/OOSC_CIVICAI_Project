from abc import ABC, abstractmethod
import logging
from typing import Optional

import httpx

from app.core.config import get_settings
from app.services.rag.knowledge import KnowledgeDoc, search_knowledge

logger = logging.getLogger(__name__)

OFFICIAL_DOMAIN_HINTS = (
    ".gov.in",
    ".nic.in",
    "indiacode.nic.in",
    "pgportal.gov.in",
    "cic.gov.in",
    "chennaicorporation.gov.in",
    "india.gov.in",
)


def classify_authority_level(url: Optional[str], title: str = "") -> str:
    u = (url or "").lower()
    t = title.lower()
    if any(h in u for h in OFFICIAL_DOMAIN_HINTS):
        if "indiacode" in u or "act" in t:
            return "STATUTORY"
        return "OFFICIAL"
    if u.endswith(".gov.in") or ".gov.in/" in u:
        return "OFFICIAL"
    return "UNKNOWN"


class WebSearchProvider(ABC):
    @abstractmethod
    async def search(
        self,
        query: str,
        *,
        max_results: int = 5,
        include_domains: Optional[list[str]] = None,
    ) -> list[dict]:
        raise NotImplementedError

    @abstractmethod
    async def health(self) -> str:
        raise NotImplementedError


class TavilyWebSearchProvider(WebSearchProvider):
    def __init__(self) -> None:
        self.settings = get_settings()
        self.api_key = self.settings.tavily_api_key

    async def health(self) -> str:
        if not self.api_key:
            return "not_configured"
        return "configured"

    async def search(
        self,
        query: str,
        *,
        max_results: int = 5,
        include_domains: Optional[list[str]] = None,
    ) -> list[dict]:
        if not self.api_key:
            return []

        domains = include_domains or [
            "gov.in",
            "nic.in",
            "indiacode.nic.in",
            "pgportal.gov.in",
            "cic.gov.in",
        ]
        payload = {
            "api_key": self.api_key,
            "query": query,
            "search_depth": "advanced",
            "include_answer": False,
            "max_results": max_results,
            "include_domains": domains,
        }
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                r = await client.post("https://api.tavily.com/search", json=payload)
                r.raise_for_status()
                data = r.json()
        except Exception as exc:  # noqa: BLE001
            logger.warning("Tavily search failed: %s", exc)
            return []

        results = []
        for item in data.get("results") or []:
            url = item.get("url")
            title = item.get("title") or "Untitled"
            content = item.get("content") or ""
            level = classify_authority_level(url, title)
            if level == "UNKNOWN":
                continue
            results.append(
                {
                    "title": title,
                    "url": url,
                    "content": content,
                    "authority_level": level,
                    "score": float(item.get("score") or 0),
                    "authority": "Web (official domain)",
                }
            )
        return results


class LocalKnowledgeSearchProvider(WebSearchProvider):
    """Offline-safe search over curated official knowledge."""

    async def health(self) -> str:
        return "local_knowledge"

    async def search(
        self,
        query: str,
        *,
        max_results: int = 5,
        include_domains: Optional[list[str]] = None,  # noqa: ARG002
    ) -> list[dict]:
        docs = search_knowledge(query, top_k=max_results)
        return [
            {
                "title": d.title,
                "url": d.source_url,
                "content": d.content,
                "authority_level": d.authority_level,
                "score": 1.0,
                "authority": d.authority,
                "source_id": d.id,
                "section": d.section,
                "last_verified": d.last_verified,
                "state": d.state,
            }
            for d in docs
        ]


class CompositeWebSearchProvider(WebSearchProvider):
    def __init__(self) -> None:
        self.tavily = TavilyWebSearchProvider()
        self.local = LocalKnowledgeSearchProvider()

    async def health(self) -> str:
        t = await self.tavily.health()
        return f"tavily:{t};local:ok"

    async def search(
        self,
        query: str,
        *,
        max_results: int = 5,
        include_domains: Optional[list[str]] = None,
    ) -> list[dict]:
        remote = await self.tavily.search(
            query, max_results=max_results, include_domains=include_domains
        )
        local = await self.local.search(query, max_results=max_results)
        # Prefer local curated + fill with remote official
        merged: list[dict] = []
        seen_urls: set[str] = set()
        for item in local + remote:
            url = item.get("url") or item.get("title")
            if url in seen_urls:
                continue
            seen_urls.add(url)
            merged.append(item)
            if len(merged) >= max_results:
                break
        return merged


def get_web_search() -> WebSearchProvider:
    return CompositeWebSearchProvider()
