from fastapi import APIRouter

from app.api.v1 import cases, health, search

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router, tags=["health"])
api_router.include_router(cases.router, tags=["cases"])
api_router.include_router(search.router, tags=["search"])
