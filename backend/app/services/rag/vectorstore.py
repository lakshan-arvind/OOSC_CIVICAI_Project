from abc import ABC, abstractmethod
import logging
from typing import Any, Optional

from app.core.config import get_settings
from app.services.rag.knowledge import KNOWLEDGE_BASE, KnowledgeDoc, search_knowledge

logger = logging.getLogger(__name__)


class VectorStore(ABC):
    @abstractmethod
    async def upsert(self, documents: list[dict[str, Any]]) -> int:
        raise NotImplementedError

    @abstractmethod
    async def query(
        self,
        text: str,
        *,
        top_k: int = 5,
        filter: Optional[dict[str, Any]] = None,
    ) -> list[dict[str, Any]]:
        raise NotImplementedError

    @abstractmethod
    async def health(self) -> str:
        raise NotImplementedError


class LocalVectorStore(VectorStore):
    """Keyword retrieval over curated knowledge (Pinecone-compatible interface)."""

    def __init__(self) -> None:
        self._extra: list[KnowledgeDoc] = []

    async def health(self) -> str:
        return "local"

    async def upsert(self, documents: list[dict[str, Any]]) -> int:
        for d in documents:
            self._extra.append(
                KnowledgeDoc(
                    id=d.get("id") or d.get("document_id") or f"ingested-{len(self._extra)}",
                    title=d.get("title") or "Untitled",
                    authority=d.get("authority") or "Unknown",
                    authority_level=d.get("authority_level") or "UNKNOWN",
                    source_url=d.get("source_url") or "",
                    content=d.get("content") or "",
                    section=d.get("section"),
                    page=d.get("page"),
                    last_verified=d.get("last_verified") or "unknown",
                    state=d.get("state"),
                    document_type=d.get("document_type") or "document",
                    government_level=d.get("government_level") or "unknown",
                    language=d.get("language") or "en",
                    tags=d.get("tags") or [],
                )
            )
        return len(documents)

    async def query(
        self,
        text: str,
        *,
        top_k: int = 5,
        filter: Optional[dict[str, Any]] = None,
    ) -> list[dict[str, Any]]:
        state = (filter or {}).get("state")
        docs = search_knowledge(text, state=state, top_k=top_k)
        # Also scan upserted docs with simple keyword overlap
        if self._extra:
            q = text.lower()
            extras = []
            for d in self._extra:
                if any(tok in f"{d.title} {d.content}".lower() for tok in q.split() if len(tok) > 3):
                    if state and d.state and state.lower() not in (d.state or "").lower():
                        continue
                    extras.append(d)
            docs = (extras + docs)[:top_k]

        return [
            {
                "id": d.id,
                "title": d.title,
                "authority": d.authority,
                "authority_level": d.authority_level,
                "source_url": d.source_url,
                "content": d.content,
                "section": d.section,
                "page": d.page,
                "last_verified": d.last_verified,
                "state": d.state,
                "snippet": d.content[:280],
            }
            for d in docs
        ]


class PineconeVectorStore(VectorStore):
    def __init__(self) -> None:
        self.settings = get_settings()
        self._local = LocalVectorStore()
        self._client = None
        if self.settings.pinecone_api_key:
            try:
                from pinecone import Pinecone  # type: ignore

                self._client = Pinecone(api_key=self.settings.pinecone_api_key)
                logger.info("Pinecone client initialized")
            except Exception as exc:  # noqa: BLE001
                logger.warning("Pinecone init failed, using local store: %s", exc)

    async def health(self) -> str:
        if not self.settings.pinecone_api_key:
            return "not_configured"
        if self._client is None:
            return "init_failed"
        return "configured"

    async def upsert(self, documents: list[dict[str, Any]]) -> int:
        # Always keep local copy for reliability in hackathon demos
        return await self._local.upsert(documents)

    async def query(
        self,
        text: str,
        *,
        top_k: int = 5,
        filter: Optional[dict[str, Any]] = None,
    ) -> list[dict[str, Any]]:
        # Production would embed with BGE-M3 and query Pinecone.
        # For MVP reliability we retrieve from local curated + ingested docs.
        return await self._local.query(text, top_k=top_k, filter=filter)


_store: Optional[VectorStore] = None


def get_vector_store() -> VectorStore:
    global _store
    if _store is None:
        _store = PineconeVectorStore()
    return _store


def seed_local_index() -> None:
    """Ensure curated docs are available (no-op for LocalVectorStore search_knowledge)."""
    logger.info("Knowledge base ready with %s curated documents", len(KNOWLEDGE_BASE))
