from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class InvitationTemplateBase(BaseModel):
    name: str
    company_name: str
    title: str
    content: str

    event_time: datetime | None = None
    event_location: str | None = None
    google_map_url: str | None = None
    schedule: list[dict[str, Any]] | None = None


class InvitationTemplateCreate(InvitationTemplateBase):
    pass


class InvitationTemplateUpdate(BaseModel):
    name: str | None = None
    company_name: str | None = None
    title: str | None = None
    content: str | None = None

    event_time: datetime | None = None
    event_location: str | None = None
    google_map_url: str | None = None
    schedule: list[dict[str, Any]] | None = None


class InvitationTemplateOut(InvitationTemplateBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime
