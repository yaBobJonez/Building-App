from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict

from models import IncidentPriority, IncidentStatus


class IncidentCreate(BaseModel):
    title: str
    project_id: UUID
    created_by: UUID
    description: Optional[str] = None
    priority: Optional[IncidentPriority] = None
    status: Optional[IncidentStatus] = None


class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    incident_id: UUID
    project_id: UUID
    title: str
    description: Optional[str]
    priority: IncidentPriority
    status: IncidentStatus
    created_at: datetime
    resolved_at: Optional[datetime]
    created_by: UUID
