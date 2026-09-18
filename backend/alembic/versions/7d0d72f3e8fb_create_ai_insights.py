"""create AI insights

Revision ID: 7d0d72f3e8fb
Revises: 203c9a901518
Create Date: 2026-09-18 12:00:00.000000
"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "7d0d72f3e8fb"
down_revision: str | None = "203c9a901518"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "ai_insights",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("insight_type", sa.String(length=64), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("recommendations", sa.JSON(), nullable=False),
        sa.Column("supporting_metrics", sa.JSON(), nullable=False),
        sa.Column("model_name", sa.String(length=120), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ai_insights_user_id", "ai_insights", ["user_id"], unique=False)
    op.create_index("ix_ai_insights_insight_type", "ai_insights", ["insight_type"], unique=False)
    op.create_index("ix_ai_insights_status", "ai_insights", ["status"], unique=False)
    op.create_index("ix_ai_insights_expires_at", "ai_insights", ["expires_at"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_ai_insights_expires_at", table_name="ai_insights")
    op.drop_index("ix_ai_insights_status", table_name="ai_insights")
    op.drop_index("ix_ai_insights_insight_type", table_name="ai_insights")
    op.drop_index("ix_ai_insights_user_id", table_name="ai_insights")
    op.drop_table("ai_insights")
