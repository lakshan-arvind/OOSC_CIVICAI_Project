from datetime import datetime, timezone

from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    """Instant health check for Render — no DB or external probes."""
    settings = get_settings()

    if settings.tavily_api_key:
        tavily_status = "configured"
    else:
        tavily_status = "not_configured"

    if settings.pinecone_api_key:
        pinecone_status = "configured"
    else:
        pinecone_status = "not_configured"

    return HealthResponse(
        status="ok",
        app=settings.app_name,
        environment=settings.environment,
        database="unknown",
        ollama="fallback" if settings.is_production or settings.llm_provider == "fallback" else "auto",
        tavily=tavily_status,
        pinecone=pinecone_status,
        timestamp=datetime.now(timezone.utc),
    )
