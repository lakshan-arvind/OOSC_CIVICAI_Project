from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.schemas import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health(db: Session = Depends(get_db)) -> HealthResponse:
    """Fast health check for Render/Vercel — avoids slow external service probes."""
    settings = get_settings()

    db_status = "ok"
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:  # noqa: BLE001
        db_status = f"error:{exc.__class__.__name__}"

    if settings.tavily_api_key:
        tavily_status = "configured"
    else:
        tavily_status = "not_configured"

    if settings.pinecone_api_key:
        pinecone_status = "configured"
    else:
        pinecone_status = "not_configured"

    overall = "ok" if db_status == "ok" else "degraded"

    return HealthResponse(
        status=overall,
        app=settings.app_name,
        environment=settings.environment,
        database=db_status,
        ollama="fallback",
        tavily=tavily_status,
        pinecone=pinecone_status,
        timestamp=datetime.now(timezone.utc),
    )
