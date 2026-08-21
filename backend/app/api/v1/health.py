from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.schemas import HealthResponse
from app.services.llm.provider import get_llm, reset_llm_provider
from app.services.rag.vectorstore import get_vector_store
from app.services.search.web import get_web_search

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health(db: Session = Depends(get_db)) -> HealthResponse:
    settings = get_settings()

    db_status = "ok"
    try:
        db.execute(__import__("sqlalchemy").text("SELECT 1"))
    except Exception as exc:  # noqa: BLE001
        db_status = f"error:{exc.__class__.__name__}"

    reset_llm_provider()
    llm = await get_llm()
    ollama_status = await llm.health()

    search = get_web_search()
    tavily_status = await search.health()

    store = get_vector_store()
    pinecone_status = await store.health()

    overall = "ok" if db_status == "ok" else "degraded"

    return HealthResponse(
        status=overall,
        app=settings.app_name,
        environment=settings.environment,
        database=db_status,
        ollama=ollama_status,
        tavily=tavily_status,
        pinecone=pinecone_status,
        timestamp=datetime.now(timezone.utc),
    )
