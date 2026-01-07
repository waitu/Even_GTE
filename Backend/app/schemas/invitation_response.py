from uuid import UUID
from datetime import datetime
from pydantic import BaseModel
from pydantic import ConfigDict
from app.models.rsvp import RsvpStatus

class InvitationResponseBase(BaseModel):
    response: RsvpStatus


class InvitationResponseCreate(InvitationResponseBase):
    attendee_count: int | None = None

class InvitationResponseOut(InvitationResponseBase):
    id: UUID
    invitation_id: UUID
    attendee_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
