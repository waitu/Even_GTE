import uuid
from sqlalchemy import Column, DateTime, ForeignKey, Integer, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base
from app.models.rsvp import RSVP_STATUS_ENUM, RsvpStatus

class InvitationResponse(Base):
    __tablename__ = "invitation_responses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invitation_id = Column(UUID(as_uuid=True), ForeignKey("invitations.id"), nullable=False)
    responder_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    response = Column(RSVP_STATUS_ENUM, nullable=False)
    attendee_count = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    invitation = relationship("Invitation", backref="responses")
