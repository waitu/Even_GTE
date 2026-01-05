from uuid import UUID
from datetime import datetime
from pydantic import BaseModel
from pydantic import ConfigDict

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: UUID
    is_admin: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
