import uuid
import enum
from sqlalchemy import Column, String, Text, Numeric, Boolean, TIMESTAMP, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from database import Base


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    ENGINEER = "ENGINEER"

class ProjectStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    DENIED = "DENIED"
    COMPLETED = "COMPLETED"


class User(Base):
    __tablename__ = "user"

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(Text, nullable=False)
    full_name = Column(String(255))
    role = Column(Enum(UserRole, name="user_role_enum"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)


class Project(Base):
    __tablename__ = "project"
    creator = relationship("User", backref="projects")

    project_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    address = Column(Text, nullable=False)
    initial_budget = Column(Numeric(15, 2), nullable=False)
    status = Column(Enum(ProjectStatus, name="project_status_enum"), nullable=False, server_default="ACTIVE")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    completed_at = Column(TIMESTAMP(timezone=True), nullable=True)
    archived = Column(Boolean, nullable=False, server_default="false")
    created_by = Column(UUID(as_uuid=True), ForeignKey("user.user_id"), nullable=False)
