"""add_recipient_salutation

Revision ID: a9c2f0c6b3d1
Revises: 76f361e0f6b8
Create Date: 2026-01-05

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a9c2f0c6b3d1'
down_revision = '76f361e0f6b8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('invitations', sa.Column('recipient_salutation', sa.String(length=32), nullable=True))


def downgrade() -> None:
    op.drop_column('invitations', 'recipient_salutation')
