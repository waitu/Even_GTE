"""add responder_id for rsvp upsert

Revision ID: d4f6a2e0c1b2
Revises: c3d2b1a8b77a
Create Date: 2026-01-05

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "d4f6a2e0c1b2"
down_revision = "c3d2b1a8b77a"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("invitation_responses", sa.Column("responder_id", sa.UUID(), nullable=True))

    # Backfill existing rows with a stable UUID (reuse row id).
    op.execute("UPDATE invitation_responses SET responder_id = id WHERE responder_id IS NULL")

    op.alter_column("invitation_responses", "responder_id", nullable=False)

    op.create_index("ix_invitation_responses_responder_id", "invitation_responses", ["responder_id"], unique=False)
    op.create_unique_constraint(
        "uq_invitation_responses_invitation_responder",
        "invitation_responses",
        ["invitation_id", "responder_id"],
    )


def downgrade() -> None:
    op.drop_constraint("uq_invitation_responses_invitation_responder", "invitation_responses", type_="unique")
    op.drop_index("ix_invitation_responses_responder_id", table_name="invitation_responses")
    op.drop_column("invitation_responses", "responder_id")
