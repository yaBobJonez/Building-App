import uuid
import enum
from sqlalchemy import Column, String, Text, TIMESTAMP, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from database import Base


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    ENGINEER = "ENGINEER"


class User(Base):
    __tablename__ = "user"

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(Text, nullable=False)
    full_name = Column(String(255))
    role = Column(Enum(UserRole, name="user_role_enum"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
