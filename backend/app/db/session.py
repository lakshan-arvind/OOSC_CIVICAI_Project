from collections.abc import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()

connect_args = {"check_same_thread": False} if settings.is_sqlite else {}
if not settings.is_sqlite:
    if "sslmode=" not in settings.database_url:
        # Render external Postgres URLs may require SSL; internal URLs ignore this safely.
        connect_args = {**connect_args, "sslmode": "prefer"}
    # Avoid hanging forever when Postgres is unreachable during cold start.
    connect_args = {**connect_args, "connect_timeout": 10}
engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_timeout=10,
)

if settings.is_sqlite:

    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):  # noqa: ARG001
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

_db_initialized = False


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    global _db_initialized
    if not _db_initialized:
        init_db()
        _db_initialized = True
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    global _db_initialized
    from app import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _db_initialized = True
