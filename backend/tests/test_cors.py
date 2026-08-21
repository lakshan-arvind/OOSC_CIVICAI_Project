import pytest
from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.main import create_app


def _options(client: TestClient, origin: str):
    return client.options(
        "/api/v1/cases",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )


def test_cors_allows_localhost_in_development(client):
    r = _options(client, "http://localhost:3000")
    assert r.status_code == 200
    assert r.headers.get("access-control-allow-origin") == "http://localhost:3000"


def test_cors_allows_vercel_origin_in_production(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "production")
    get_settings.cache_clear()
    try:
        with TestClient(create_app()) as client:
            origin = "https://oosc-civicai-project.vercel.app"
            r = _options(client, origin)
            assert r.status_code == 200
            assert r.headers.get("access-control-allow-origin") == origin
    finally:
        get_settings.cache_clear()
