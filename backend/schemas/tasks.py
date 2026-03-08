from typing import Optional
from uuid import UUID
from datetime import datetime, date
from pydantic import BaseModel

from models import TaskStatus


class TaskCreate(BaseModel):
    title: str
    project_id: UUID
    created_by: UUID
    description: Optional[str] = None
    deadline: Optional[date] = None
    status: Optional[TaskStatus] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[date] = None


class TaskStatusUpdate(BaseModel):
    status: TaskStatus
    changed_by: UUID


class TaskResponse(BaseModel):
    task_id: UUID
    project_id: UUID
    title: str
    description: Optional[str]
    deadline: Optional[date]
    status: TaskStatus
    created_at: datetime
    created_by: UUID

    class Config:
        from_attributes = True


class TaskStatusResponse(BaseModel):
    status: TaskStatus
    changed_at: datetime
    changed_by: UUID

    class Config:
        from_attributes = True
