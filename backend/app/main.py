import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1 import api_router
from app.core.config import get_settings
from app.core.logging import setup_logging
from app.db.session import init_db
from app.services.rag.vectorstore import seed_local_index

logger = logging.getLogger(__name__)


def _init_db_safe() -> None:
    try:
        init_db()
        logger.info("Database tables ready")
    except Exception:
        logger.exception("Database initialization failed")


@asynccontextmanager
async def lifespan(_: FastAPI):
    setup_logging()
    seed_local_index()
    # SQLite init is fast; keep Postgres init non-blocking in production.
    settings = get_settings()
    if settings.is_production and not settings.is_sqlite:
        asyncio.create_task(asyncio.to_thread(_init_db_safe))
    else:
        _init_db_safe()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_origin_regex=settings.cors_origin_regex,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        max_age=600,
    )

    @app.middleware("http")
    async def limit_body_size(request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > settings.max_request_size_mb * 1024 * 1024:
            return JSONResponse(
                status_code=413,
                content={"detail": "Request too large.", "code": "payload_too_large"},
            )
        return await call_next(request)

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(_: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={
                "detail": "CivicAI is temporarily unavailable. Please try again.",
                "code": "internal_error",
            },
        )

    app.include_router(api_router)

    @app.get("/health")
    async def render_health():
        return {"status": "ok", "app": settings.app_name}

    @app.get("/")
    async def root():
        return {
            "app": settings.app_name,
            "message": "CivicAI API",
            "health": "/api/v1/health",
            "docs": "/docs",
        }

    return app


app = create_app()
