"""create civic ai tables

Revision ID: 0001_initial
Revises:
Create Date: 2026-08-21
"""

from typing import Sequence, Union

from alembic import op

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    from app import models  # noqa: F401
    from app.db.session import Base

    bind = op.get_bind()
    Base.metadata.create_all(bind=bind)


def downgrade() -> None:
    from app.db.session import Base

    bind = op.get_bind()
    Base.metadata.drop_all(bind=bind)
