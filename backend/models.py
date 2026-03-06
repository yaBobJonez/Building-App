import uuid
import enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy import (
    Column, ForeignKey, UniqueConstraint,
    String, Text,
    Numeric, Integer,
    Boolean,
    Date, TIMESTAMP,
    Enum
)

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

class DocumentStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    STABLE = "STABLE"
    ARCHIVED = "ARCHIVE"

class IncidentPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class IncidentStatus(str, enum.Enum):
    OPEN = "OPEN"
    RESOLVED = "RESOLVED"


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
    status_history = relationship("ProjectStatusHistory", backref="project", passive_deletes=True)
    tasks = relationship("Task", backref="project", passive_deletes=True)
    documents = relationship("Document", backref="project", passive_deletes=True)
    incidents = relationship("Incident", backref="project", passive_deletes=True)

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
    user = relationship("User")

    history_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("project.project_id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum(ProjectStatus, name="project_status_enum"), nullable=False)
    changed_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    changed_by = Column(UUID(as_uuid=True), ForeignKey("user.user_id"), nullable=False)


class Task(Base):
    __tablename__ = "task"
    creator = relationship("User")
    status_history = relationship("TaskStatusHistory", backref="task", passive_deletes=True)

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
    user = relationship("User")

    history_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(UUID(as_uuid=True), ForeignKey("task.task_id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum(TaskStatus, name="task_status_enum"), nullable=False)
    changed_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    changed_by = Column(UUID(as_uuid=True), ForeignKey("user.user_id"), nullable=False)


class Document(Base):
    __tablename__ = "document"
    creator = relationship("User")
    versions = relationship("DocumentVersion", backref="document", passive_deletes=True)

    document_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("project.project_id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("user.user_id"), nullable=False)


class DocumentVersion(Base):
    __tablename__ = "document_version"
    __table_args__ = (UniqueConstraint('document_id', 'version_number', name='uix_document_version'),)
    uploader = relationship("User")

    version_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("document.document_id", ondelete="CASCADE"), nullable=False)
    version_number = Column(Integer, nullable=False)
    file_path = Column(Text, nullable=False)
    uploaded_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    status = Column(Enum(DocumentStatus, name="document_status_enum"), nullable=False, server_default="DRAFT")
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("user.user_id"), nullable=False)


class Incident(Base):
    __tablename__ = "incident"
    creator = relationship("User")

    incident_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("project.project_id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(Enum(IncidentPriority, name="incident_priority_enum"), nullable=False, server_default="MEDIUM")
    status = Column(Enum(IncidentStatus, name="incident_status_enum"), nullable=False, server_default="OPEN")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    resolved_at = Column(TIMESTAMP(timezone=True), nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("user.user_id"), nullable=False)
