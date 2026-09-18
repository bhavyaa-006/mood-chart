"""create profiles and practice goals

Revision ID: 20dd20540b47
Revises: 3255ea11a649
Create Date: 2026-09-18 09:48:10.731970
"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = '20dd20540b47'
down_revision: str | None = '3255ea11a649'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "profiles",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("display_name", sa.String(length=100), nullable=True),
        sa.Column("timezone", sa.String(length=64), nullable=False),
        sa.Column("onboarding_completed", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )
    op.create_index("ix_profiles_user_id", "profiles", ["user_id"], unique=True)
    op.create_table(
        "practice_goals",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("category", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "category", name="uq_practice_goal_user_category"),
    )
    op.create_index("ix_practice_goals_user_id", "practice_goals", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_practice_goals_user_id", table_name="practice_goals")
    op.drop_table("practice_goals")
    op.drop_index("ix_profiles_user_id", table_name="profiles")
    op.drop_table("profiles")
