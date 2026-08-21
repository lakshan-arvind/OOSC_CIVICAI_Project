from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.schemas import (
    RetrieveRequest,
    SearchRequest,
    SearchResponse,
    SearchResult,
)
from app.services.rag.knowledge import KNOWLEDGE_BASE
from app.services.rag.vectorstore import get_vector_store
from app.services.search.web import get_web_search

router = APIRouter()


@router.post("/search", response_model=SearchResponse)
async def search(payload: SearchRequest) -> SearchResponse:
    provider = get_web_search()
    q = payload.query
    if payload.city or payload.state:
        q = f"{payload.query} {payload.city or ''} {payload.state or ''}".strip()
    try:
        results = await provider.search(q, max_results=8)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=503,
            detail="I couldn't access the official information sources right now. Please try again.",
        ) from exc

    return SearchResponse(
        results=[
            SearchResult(
                title=r.get("title") or "Source",
                url=r.get("url"),
                content=r.get("content") or "",
                authority_level=r.get("authority_level") or "UNKNOWN",
                score=float(r.get("score") or 0),
            )
            for r in results
        ]
    )


@router.post("/retrieve")
async def retrieve(payload: RetrieveRequest) -> dict:
    store = get_vector_store()
    try:
        docs = await store.query(
            payload.query,
            top_k=payload.top_k,
            filter={"state": payload.state} if payload.state else None,
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=503,
            detail="Insufficient authoritative evidence. Retrieval is temporarily unavailable.",
        ) from exc
    return {"results": docs}


@router.get("/sources/{source_id}")
async def get_source(source_id: str) -> dict:
    for doc in KNOWLEDGE_BASE:
        if doc.id == source_id:
            return {
                "id": doc.id,
                "title": doc.title,
                "authority": doc.authority,
                "authority_level": doc.authority_level,
                "source_url": doc.source_url,
                "section": doc.section,
                "page": doc.page,
                "last_verified": doc.last_verified,
                "content": doc.content,
            }
    raise HTTPException(status_code=404, detail="Source not found.")


class IngestRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=500)
    content: str = Field(..., min_length=10, max_length=20000)
    authority: str = "Uploaded document"
    authority_level: str = "UNKNOWN"
    source_url: str | None = None
    state: str | None = None


@router.post("/documents/ingest")
async def ingest_document(payload: IngestRequest) -> dict:
    store = get_vector_store()
    count = await store.upsert(
        [
            {
                "title": payload.title,
                "content": payload.content,
                "authority": payload.authority,
                "authority_level": payload.authority_level,
                "source_url": payload.source_url or "",
                "state": payload.state,
            }
        ]
    )
    return {"ingested": count}
