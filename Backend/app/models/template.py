import uuid

from sqlalchemy import Column, DateTime, JSON, String, Text, func
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base


class InvitationTemplate(Base):
    __tablename__ = "invitation_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(128), unique=True, nullable=False)
    company_name = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)

    event_time = Column(DateTime, nullable=True)
    event_location = Column(String(255), nullable=True)
    google_map_url = Column(String(512), nullable=True)
    schedule = Column(JSON, nullable=True)

    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
