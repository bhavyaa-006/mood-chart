"""create activities and sessions

Revision ID: 72479e68e09f
Revises: d1c3fb115926
Create Date: 2026-09-18 10:19:55.062329
"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = '72479e68e09f'
down_revision: str | None = 'd1c3fb115926'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "activities",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=64), nullable=False),
        sa.Column("difficulty", sa.String(length=32), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index("ix_activities_category", "activities", ["category"], unique=False)
    op.create_table(
        "activity_sessions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("activity_id", sa.String(length=36), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("score", sa.Integer(), nullable=True),
        sa.Column("metadata_json", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(["activity_id"], ["activities.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_activity_sessions_user_id", "activity_sessions", ["user_id"], unique=False)
    op.create_index("ix_activity_sessions_activity_id", "activity_sessions", ["activity_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_activity_sessions_activity_id", table_name="activity_sessions")
    op.drop_index("ix_activity_sessions_user_id", table_name="activity_sessions")
    op.drop_table("activity_sessions")
    op.drop_index("ix_activities_category", table_name="activities")
    op.drop_table("activities")
