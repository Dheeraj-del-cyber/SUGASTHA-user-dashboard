from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    phone: str
    role: str
    is_active: bool = True

class UserCreate(UserBase):
    password: Optional[str] = None

class UserOut(UserBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True
