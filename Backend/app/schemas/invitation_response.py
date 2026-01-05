from uuid import UUID
from datetime import datetime
from pydantic import BaseModel
from pydantic import ConfigDict
from app.models.rsvp import RsvpStatus

class InvitationResponseBase(BaseModel):
    response: RsvpStatus

class InvitationResponseCreate(InvitationResponseBase):
    pass

class InvitationResponseOut(InvitationResponseBase):
    id: UUID
    invitation_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
