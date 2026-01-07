"""add attendee_count

Revision ID: 3f1c7a9b1c2d
Revises: d4f6a2e0c1b2
Create Date: 2026-01-07

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "3f1c7a9b1c2d"
down_revision = "d4f6a2e0c1b2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "invitations",
        sa.Column("attendee_count", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column(
        "invitation_responses",
        sa.Column("attendee_count", sa.Integer(), nullable=False, server_default="1"),
    )

    # Keep only the newest response per invitation (older logic created 1 response per browser).
    op.execute(
        """
        DELETE FROM invitation_responses r
        USING (
          SELECT id,
                 ROW_NUMBER() OVER (PARTITION BY invitation_id ORDER BY created_at DESC, id DESC) AS rn
          FROM invitation_responses
        ) s
        WHERE r.id = s.id AND s.rn > 1;
        """
    )

    op.create_unique_constraint(
        "uq_invitation_responses_invitation_id",
        "invitation_responses",
        ["invitation_id"],
    )

    # Backfill: if declined, treat as 0 attendees.
    op.execute(
        "UPDATE invitation_responses SET attendee_count = 0 WHERE response = 'DECLINED'"
    )

    # Remove server defaults after backfill.
    op.alter_column("invitations", "attendee_count", server_default=None)
    op.alter_column("invitation_responses", "attendee_count", server_default=None)


def downgrade() -> None:
    op.drop_constraint(
        "uq_invitation_responses_invitation_id",
        "invitation_responses",
        type_="unique",
    )
    op.drop_column("invitation_responses", "attendee_count")
    op.drop_column("invitations", "attendee_count")
