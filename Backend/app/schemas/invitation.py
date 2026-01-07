from typing import List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field
from pydantic import ConfigDict
from app.models.rsvp import RsvpStatus

class ScheduleItem(BaseModel):
    time: str
    label: str

class InvitationBase(BaseModel):
    title: str
    company_name: str
    recipient_salutation: Optional[str] = None
    recipient_name: str
    recipient_title: str
    content: str
    event_time: datetime
    event_location: str
    google_map_url: Optional[str] = None
    schedule: Optional[List[ScheduleItem]] = None

class InvitationCreate(InvitationBase):
    status: str | None = None

class InvitationUpdate(InvitationBase):
    status: Optional[str] = None

class InvitationOut(InvitationBase):
    id: UUID
    slug: Optional[str]
    status: str
    rsvp_status: RsvpStatus
    attendee_count: int = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InvitationAdminListItem(InvitationOut):
    responses: int = 0
    attending: int = 0
    attending_people: int = 0
    declined: int = 0
