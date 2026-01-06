from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel


class InvitationImportCreatedItem(BaseModel):
    row: int
    id: UUID
    slug: str | None = None


class InvitationImportErrorItem(BaseModel):
    row: int
    message: str


class InvitationImportResult(BaseModel):
    created: int
    skipped: int
    items: list[InvitationImportCreatedItem]
    errors: list[InvitationImportErrorItem]
