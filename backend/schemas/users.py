from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr

from models import UserRole


class UserCreate(BaseModel):
    email: EmailStr
    password_hash: str
    role: UserRole
    full_name: Optional[str] = None


class UserUpdate(BaseModel):
    password_hash: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None


class UserResponse(BaseModel):
    user_id: UUID
    email: EmailStr
    full_name: Optional[str]
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True
