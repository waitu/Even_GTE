"""add rsvp status

Revision ID: c3d2b1a8b77a
Revises: a9c2f0c6b3d1
Create Date: 2026-01-05

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "c3d2b1a8b77a"
down_revision = "a9c2f0c6b3d1"
branch_labels = None
depends_on = None


def upgrade() -> None:
    rsvp_enum = sa.Enum("ATTENDING", "DECLINED", "PENDING", name="rsvpstatus")
    rsvp_enum.create(op.get_bind(), checkfirst=True)

    op.add_column(
        "invitations",
        sa.Column(
            "rsvp_status",
            sa.Enum("ATTENDING", "DECLINED", "PENDING", name="rsvpstatus"),
            nullable=False,
            server_default="PENDING",
        ),
    )

    # Migrate invitation_responses.response enum from responsestatus -> rsvpstatus
    op.execute(
        """
        ALTER TABLE invitation_responses
        ALTER COLUMN response TYPE rsvpstatus
        USING (
            CASE
                WHEN response::text = 'attending' THEN 'ATTENDING'
                WHEN response::text = 'not_attending' THEN 'DECLINED'
                ELSE 'PENDING'
            END
        )::rsvpstatus
        """
    )

    # Derive invitations.rsvp_status from existing responses
    op.execute(
        """
        UPDATE invitations
        SET rsvp_status = 'ATTENDING'
        WHERE EXISTS (
            SELECT 1 FROM invitation_responses r
            WHERE r.invitation_id = invitations.id AND r.response = 'ATTENDING'
        )
        """
    )
    op.execute(
        """
        UPDATE invitations
        SET rsvp_status = 'DECLINED'
        WHERE rsvp_status = 'PENDING'
          AND EXISTS (
            SELECT 1 FROM invitation_responses r
            WHERE r.invitation_id = invitations.id AND r.response = 'DECLINED'
          )
        """
    )

    # Old enum no longer used
    op.execute("DROP TYPE IF EXISTS responsestatus")

    # Keep default as PENDING for future rows


def downgrade() -> None:
    # Re-create old enum
    old_enum = sa.Enum("attending", "not_attending", name="responsestatus")
    old_enum.create(op.get_bind(), checkfirst=True)

    op.execute(
        """
        ALTER TABLE invitation_responses
        ALTER COLUMN response TYPE responsestatus
        USING (
            CASE
                WHEN response::text = 'ATTENDING' THEN 'attending'
                WHEN response::text = 'DECLINED' THEN 'not_attending'
                ELSE 'attending'
            END
        )::responsestatus
        """
    )

    op.drop_column("invitations", "rsvp_status")

    op.execute("DROP TYPE IF EXISTS rsvpstatus")
