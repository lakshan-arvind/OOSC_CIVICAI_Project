from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1 import api_router
from app.core.config import get_settings
from app.core.logging import setup_logging
from app.db.session import init_db
from app.services.rag.vectorstore import seed_local_index


@asynccontextmanager
async def lifespan(_: FastAPI):
    setup_logging()
    init_db()
    seed_local_index()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version="1.0.0",
        lifespan=lifespan,
    docs_url="/docs" if settings.environment != "production" else None,
    redoc_url="/redoc" if settings.environment != "production" else None,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
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
