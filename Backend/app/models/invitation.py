import uuid
from sqlalchemy import Column, String, Text, Enum, DateTime, JSON, Integer, func
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base
import enum
from app.models.rsvp import RSVP_STATUS_ENUM, RsvpStatus

class InvitationStatus(enum.Enum):
    draft = "draft"
    published = "published"

class Invitation(Base):
    __tablename__ = "invitations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=False)
    recipient_salutation = Column(String(32), nullable=True)
    recipient_name = Column(String(255), nullable=False)
    recipient_title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    event_time = Column(DateTime, nullable=False)
    event_location = Column(String(255), nullable=False)
    google_map_url = Column(String(512), nullable=True)
    schedule = Column(JSON, nullable=True)
    slug = Column(String(255), unique=True, nullable=True)
    status = Column(Enum(InvitationStatus), nullable=False, default=InvitationStatus.draft)
    rsvp_status = Column(RSVP_STATUS_ENUM, nullable=False, default=RsvpStatus.PENDING)
    attendee_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
