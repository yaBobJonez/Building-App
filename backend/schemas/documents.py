from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

from models import DocumentStatus


class DocumentCreate(BaseModel):
    title: str
    project_id: UUID
    created_by: UUID
    status: Optional[DocumentStatus] = None


class DocumentUpdate(BaseModel):
    title: Optional[str] = None


class DocumentVersionCreate(BaseModel):
    uploaded_by: UUID
    status: Optional[DocumentStatus] = None


class DocumentVersionResponse(BaseModel):
    version_id: UUID
    document_id: UUID
    version_number: int
    file_path: str
    uploaded_at: datetime
    status: DocumentStatus
    uploaded_by: UUID

    class Config:
        from_attributes = True


class DocumentResponse(BaseModel):
    document_id: UUID
    project_id: UUID
    title: str
    created_at: datetime
    created_by: UUID

    class Config:
        from_attributes = True


class DocumentWithVersionsResponse(DocumentResponse):
    versions: List[DocumentVersionResponse]
