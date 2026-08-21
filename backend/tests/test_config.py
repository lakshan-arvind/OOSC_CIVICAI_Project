def test_normalizes_render_postgres_url():
    from app.core.config import Settings

    settings = Settings(database_url="postgres://user:pass@host:5432/db")
    assert settings.database_url.startswith("postgresql://")
    assert "user:pass@host:5432/db" in settings.database_url
