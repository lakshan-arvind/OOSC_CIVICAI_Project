"""create civic ai tables

Revision ID: 0001_initial
Revises:
Create Date: 2026-08-21
"""

from typing import Sequence, Union

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Tables are created by SQLAlchemy metadata.create_all on startup.
    pass


def downgrade() -> None:
    pass
