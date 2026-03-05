import uuid
import enum
from sqlalchemy import Column, String, Text, Numeric, Boolean, Date, TIMESTAMP, Enum, ForeignKey
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

class TaskStatus(str, enum.Enum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"


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


class ProjectStatusHistory(Base):
    __tablename__ = "project_status_history"
    project = relationship("Project", backref="status_history")
    user = relationship("User")

    history_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("project.project_id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum(ProjectStatus, name="project_status_enum"), nullable=False)
    changed_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    changed_by = Column(UUID(as_uuid=True), ForeignKey("user.user_id"), nullable=False)


class Task(Base):
    __tablename__ = "task"
    project = relationship("Project", backref="tasks")
    creator = relationship("User")

    task_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("project.project_id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    deadline = Column(Date, nullable=True)
    status = Column(Enum(TaskStatus, name="task_status_enum"), nullable=False, server_default="TODO")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("user.user_id"), nullable=False)

class TaskStatusHistory(Base):
    __tablename__ = "task_status_history"
    task = relationship("Task", backref="status_history")
    user = relationship("User")

    history_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(UUID(as_uuid=True), ForeignKey("task.task_id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum(TaskStatus, name="task_status_enum"), nullable=False)
    changed_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    changed_by = Column(UUID(as_uuid=True), ForeignKey("user.user_id"), nullable=False)
