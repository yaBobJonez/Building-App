from typing import Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel

from models import ProjectStatus


class ProjectCreate(BaseModel):
    name: str
    address: str
    initial_budget: Decimal
    created_by: UUID


class ProjectStatusUpdate(BaseModel):
    status: ProjectStatus
    changed_by: UUID


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    initial_budget: Optional[Decimal] = None


class ProjectResponse(BaseModel):
    project_id: UUID
    name: str
    address: str
    initial_budget: Decimal
    status: ProjectStatus
    created_at: datetime
    completed_at: Optional[datetime]
    archived: bool
    created_by: UUID

    class Config:
        from_attributes = True


class ProjectStatusResponse(BaseModel):
    status: ProjectStatus
    changed_at: datetime
    changed_by: UUID

    class Config:
        from_attributes = True
