"""create mood and journal entries

Revision ID: 10bb9467ce0f
Revises: 20dd20540b47
Create Date: 2026-09-18 09:54:16.643150
"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = '10bb9467ce0f'
down_revision: str | None = '20dd20540b47'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "mood_entries",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("mood", sa.Integer(), nullable=False),
        sa.Column("stress_level", sa.Integer(), nullable=False),
        sa.Column("energy_level", sa.Integer(), nullable=False),
        sa.Column("entry_date", sa.Date(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "entry_date", name="uq_mood_entry_user_date"),
    )
    op.create_index("ix_mood_entries_user_id", "mood_entries", ["user_id"], unique=False)
    op.create_table(
        "journal_entries",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("entry_date", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_journal_entries_user_id", "journal_entries", ["user_id"], unique=False)
    op.create_index("ix_journal_entries_entry_date", "journal_entries", ["entry_date"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_journal_entries_entry_date", table_name="journal_entries")
    op.drop_index("ix_journal_entries_user_id", table_name="journal_entries")
    op.drop_table("journal_entries")
    op.drop_index("ix_mood_entries_user_id", table_name="mood_entries")
    op.drop_table("mood_entries")
