import os
import uuid
from uuid import UUID
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from fastapi.responses import FileResponse
from sqlalchemy import select, update, func
from sqlalchemy.exc import IntegrityError

from database import SessionDep
from models import Document, DocumentVersion, DocumentStatus
from schemas.documents import (
    DocumentCreate,
    DocumentUpdate,
    DocumentVersionCreate,
    DocumentResponse,
    DocumentVersionResponse,
    DocumentWithVersionsResponse
)


# -=-= ДОКУМЕНТИ =-=-
router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)

# Тека для збереження версій / файлів
UPLOAD_DIR = "/var/lib/archon/files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Дозволені формати файлів (MIME-типи)
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "text/plain",
    "text/csv",
    "application/rtf",
    # Office Open XML
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    # OpenDocument
    "application/vnd.oasis.opendocument.text",
    "application/vnd.oasis.opendocument.spreadsheet",
    "application/vnd.oasis.opendocument.presentation",
}


# Отримати всі документи
@router.get("", response_model=list[DocumentResponse],
    responses={400: {"detail": "Invalid sort field"}}
)
async def get_all_documents(
    db: SessionDep,
    project: UUID | None = None,
    user: UUID | None = None,
    sort: str | None = None
):
    query = select(Document)

    if project:
        query = query.where(Document.project_id == project)
    if user:
        query = query.where(Document.created_by == user)

    if sort:
        if not hasattr(Document, sort):
            raise HTTPException(status_code=400, detail="Invalid sort field")
        query = query.order_by(getattr(Document, sort))

    result = await db.execute(query)
    return result.scalars().all()


# Створити документ
@router.post("", status_code=201,
    responses={
        400: {"detail": "Invalid project_id or user_id"},
        415: {"detail": "Forbidden file type"}
    }
)
async def create_document(
    data: DocumentCreate = Depends(),
    file: UploadFile = File(...),
    db: SessionDep = None
):
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Forbidden file type: {file.content_type}"
        )
    
    db_document = Document(title=data.title, project_id=data.project_id, created_by=data.created_by)
    db.add(db_document)
    try:
        await db.flush()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Invalid project_id or user_id")

    file_id = str(uuid.uuid4())
    _, file_ext = os.path.splitext(file.filename)
    file_path = f"{UPLOAD_DIR}/{file_id}{file_ext}"
    with open(file_path, "wb") as f:
        f.write(await file.read())

    version = DocumentVersion(
        document_id=db_document.document_id,
        version_number=1,
        file_path=file_path,
        status=data.status or DocumentStatus.DRAFT,
        uploaded_by=data.created_by
    )
    db.add(version)

    await db.commit()
    return {
        "document_id": db_document.document_id,
        "version_id": version.version_id
    }


# Отримати документ за ID
@router.get("/{document_id}", response_model=DocumentWithVersionsResponse,
    responses={404: {"detail": "Document not found"}}
)
async def get_document(
    document_id: UUID,
    db: SessionDep,
    version: int | None = None,
    status: DocumentStatus | None = None,
    user: UUID | None = None
):
    result = await db.execute(select(Document).where(Document.document_id == document_id))
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    query = select(DocumentVersion).where(DocumentVersion.document_id == document_id)
    if version:
        query = query.where(DocumentVersion.version_number == version)
    if status:
        query = query.where(DocumentVersion.status == status)
    if user:
        query = query.where(DocumentVersion.uploaded_by == user)
    result = await db.execute(query)
    
    return DocumentWithVersionsResponse(
        document_id=document.document_id,
        project_id=document.project_id,
        title=document.title,
        created_at=document.created_at,
        created_by=document.created_by,

        versions=result.scalars().all()
    )


# Пошук документів за назвою
@router.get("/by-title/{title}", response_model=list[DocumentResponse])
async def search_documents_by_title(title: str, db: SessionDep):
    result = await db.execute(
        select(Document).where(Document.title.ilike(f"%{title}%"))
    )
    return result.scalars().all()


# Отримати версію документа
@router.get("/versions/{version_id}", response_model=DocumentVersionResponse,
    responses={404: {"detail": "Version not found"}}
)
async def get_document_version(version_id: UUID, db: SessionDep):
    result = await db.execute(select(DocumentVersion).where(DocumentVersion.version_id == version_id))
    version = result.scalar_one_or_none()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    return version


# Створити нову версію документа
@router.post("/{document_id}/versions", response_model=DocumentVersionResponse,
    responses={
        404: {"detail": "Document not found"},
        415: {"detail": "Forbidden file type"}
    }
)
async def create_document_version(
    document_id: UUID,
    data: DocumentVersionCreate,
    file: UploadFile = File(...),
    db: SessionDep = None
):
    result = await db.execute(select(Document).where(Document.document_id == document_id))
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    result = await db.execute(
        select(func.max(DocumentVersion.version_number))
        .where(DocumentVersion.document_id == document_id)
    )
    max_version = result.scalar() or 0
    new_version = max_version + 1

    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Forbidden file type: {file.content_type}"
        )
    file_id = str(uuid.uuid4())
    _, file_ext = os.path.splitext(file.filename)
    file_path = f"{UPLOAD_DIR}/{file_id}{file_ext}"
    with open(file_path, "wb") as f:
        f.write(await file.read())

    status = data.status or DocumentStatus.DRAFT
    if status == DocumentStatus.STABLE:
        await db.execute(
            update(DocumentVersion)
            .where(
                DocumentVersion.document_id == document_id,
                DocumentVersion.status == DocumentStatus.STABLE
            )
            .values(status=DocumentStatus.ARCHIVED)
        )

    version = DocumentVersion(
        document_id=document_id,
        version_number=new_version,
        file_path=file_path,
        status=status,
        uploaded_by=data.uploaded_by
    )
    db.add(version)

    await db.commit()
    await db.refresh(version)
    return version


# Оновити статус версії документа
@router.put("/versions/{version_id}/status",
    responses={404: {"detail": "Version not found"}}
)
async def update_version_status(
    version_id: UUID,
    data: DocumentStatus,
    db: SessionDep
):
    result = await db.execute(select(DocumentVersion).where(DocumentVersion.version_id == version_id))
    version = result.scalar_one_or_none()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")

    if data.status == DocumentStatus.STABLE:
        await db.execute(
            update(DocumentVersion)
            .where(
                DocumentVersion.document_id == version.document_id,
                DocumentVersion.status == DocumentStatus.STABLE
            )
            .values(status=DocumentStatus.ARCHIVED)
        )
    version.status = data.status

    await db.commit()
    return {"message": "Version status updated successfully"}


# Видалення версії документа
@router.delete("/versions/{version_id}",
    responses={404: {"detail": "Version not found"}}
)
async def delete_document_version(version_id: UUID, db: SessionDep):
    result = await db.execute(select(DocumentVersion).where(DocumentVersion.version_id == version_id))
    version = result.scalar_one_or_none()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")

    file_path = version.file_path
    if os.path.exists(file_path):
        os.remove(file_path)

    await db.delete(version)
    await db.commit()
    return {"message": "Version deleted successfully"}


# Завантаження файлу версії
@router.get("/versions/{version_id}/download",
    responses={404: {"detail": "Version not found"}}
)
async def download_document_version(version_id: UUID, db: SessionDep):
    result = await db.execute(select(DocumentVersion).where(DocumentVersion.version_id == version_id))
    version = result.scalar_one_or_none()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    return FileResponse(version.file_path)


# Оновити назву документа
@router.patch("/{document_id}",
    responses={404: {"detail": "Document not found"}}
)
async def update_document(
    document_id: UUID,
    updates: DocumentUpdate,
    db: SessionDep
):
    result = await db.execute(select(Document).where(Document.document_id == document_id))
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(document, key, value)
    await db.commit()
    return {"message": "Document updated successfully"}


# Видалення документа
@router.delete("/{document_id}",
    responses={404: {"detail": "Document not found"}}
)
async def delete_document(document_id: UUID, db: SessionDep):
    result = await db.execute(select(Document).where(Document.document_id == document_id))
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    result = await db.execute(
        select(DocumentVersion.file_path)
        .where(DocumentVersion.document_id == document_id)
    )
    for path in result.scalars().all():
        if os.path.exists(path):
            os.remove(path)

    await db.delete(document)
    await db.commit()
    return {"message": "Document deleted successfully"}
