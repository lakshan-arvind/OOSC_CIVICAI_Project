from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "CivicAI"
    environment: str = "development"
    debug: bool = True

    # Prefer SQLite locally so the app boots without Docker/Postgres.
    # Set DATABASE_URL to postgresql://... for production.
    database_url: str = "sqlite:///./civic_ai.db"

    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "qwen2.5:7b"
    ollama_timeout_seconds: float = 90.0

    embedding_model: str = "BAAI/bge-m3"

    pinecone_api_key: Optional[str] = None
    pinecone_index_name: str = "civic-ai"

    tavily_api_key: Optional[str] = None

    langsmith_api_key: Optional[str] = None
    langchain_tracing_v2: bool = False
    langchain_project: str = "civic-ai"

    redis_url: Optional[str] = None

    max_request_size_mb: int = 5
    rate_limit_per_minute: int = 60

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    return Settings()
