from typing import Optional, Annotated
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, StringConstraints, Field

from models import ProjectStatus


class ProjectCreate(BaseModel):
    name: Annotated[str, StringConstraints(min_length=1, strip_whitespace=True)]
    address: Annotated[str, StringConstraints(min_length=1, strip_whitespace=True)]
    initial_budget: Annotated[Decimal, Field(ge=0)]
    created_by: UUID


class ProjectStatusUpdate(BaseModel):
    status: ProjectStatus
    changed_by: UUID


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    initial_budget: Optional[Decimal] = None


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    project_id: UUID
    name: str
    address: str
    initial_budget: Decimal
    status: ProjectStatus
    created_at: datetime
    completed_at: Optional[datetime]
    archived: bool
    created_by: UUID


class ProjectStatusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    status: ProjectStatus
    changed_at: datetime
    changed_by: UUID
