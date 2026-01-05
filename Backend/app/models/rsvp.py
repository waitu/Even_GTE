import enum

from sqlalchemy import Enum


class RsvpStatus(str, enum.Enum):
    ATTENDING = "ATTENDING"
    DECLINED = "DECLINED"
    PENDING = "PENDING"


RSVP_STATUS_ENUM = Enum(RsvpStatus, name="rsvpstatus")
