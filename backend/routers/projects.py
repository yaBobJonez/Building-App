from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from database import SessionDep
from models import Project, ProjectStatus, ProjectStatusHistory
from schemas.projects import (
    ProjectCreate,
    ProjectStatusUpdate,
    ProjectUpdate,
    ProjectResponse,
    ProjectStatusResponse
)


# -=-= БУДІВЕЛЬНІ ПРОЄКТИ =-=-
router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)


# Дозволені переходи статусу
ALLOWED_TRANSITIONS = {
    ProjectStatus.ACTIVE: [ProjectStatus.PENDING],
    ProjectStatus.PENDING: [ProjectStatus.APPROVED, ProjectStatus.DENIED],
    ProjectStatus.DENIED: [ProjectStatus.ACTIVE, ProjectStatus.PENDING],
    ProjectStatus.APPROVED: [ProjectStatus.ACTIVE, ProjectStatus.COMPLETED],
    ProjectStatus.COMPLETED: []
}


# Отримати всі проєкти
@router.get("", response_model=list[ProjectResponse],
    responses={400: {"detail": "Invalid sort field"}}
)
async def get_all_projects(
    db: SessionDep,
    status: ProjectStatus | None = None,
    archived: bool | None = None,
    user: UUID | None = None,
    sort: str | None = None
):
    query = select(Project)

    if status:
        query = query.where(Project.status == status)
    if archived is not None:
        query = query.where(Project.archived == archived)
    if user:
        query = query.where(Project.created_by == user)

    if sort:
        if not hasattr(Project, sort):
            raise HTTPException(status_code=400, detail="Invalid sort field")
        query = query.order_by(getattr(Project, sort))

    result = await db.execute(query)
    return result.scalars().all()


# Створити проєкт
@router.post("", response_model=UUID, status_code=201,
    responses={400: {"detail": "Invalid user_id"}}
)
async def create_project(project: ProjectCreate, db: SessionDep):
    db_project = Project(**project.model_dump())
    db.add(db_project)
    try:
        await db.commit()
        await db.refresh(db_project)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Invalid user_id")
    return db_project.project_id


# Отримати проєкт за ID
@router.get("/{project_id}", response_model=ProjectResponse,
    responses={404: {"detail": "Project not found"}}
)
async def get_project_by_id(project_id: UUID, db: SessionDep):
    result = await db.execute(select(Project).where(Project.project_id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


# Пошук проєктів за імʼям
@router.get("/by-name/{name}", response_model=list[ProjectResponse])
async def search_projects_by_name(name: str, db: SessionDep):
    result = await db.execute(
        select(Project).where(Project.name.ilike(f"%{name}%"))
    )
    return result.scalars().all()


# Пошук проєктів за адресою
@router.get("/by-address/{address}", response_model=list[ProjectResponse])
async def search_projects_by_address(address: str, db: SessionDep):
    result = await db.execute(
        select(Project).where(Project.address.ilike(f"%{address}%"))
    )
    return result.scalars().all()


# Оновити дані проєкту
@router.patch("/{project_id}",
    responses={
        403: {"detail": "Archived project cannot be modified"},
        404: {"detail": "Project not found"}
    }
)
async def update_project(
    project_id: UUID,
    updates: ProjectUpdate,
    db: SessionDep
):
    result = await db.execute(select(Project).where(Project.project_id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.archived:
        raise HTTPException(status_code=403, detail="Archived project cannot be modified")

    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project, key, value)
    await db.commit()
    return {"message": "Project updated successfully"}


# Зміна статусу проєкту
@router.put("/{project_id}/status",
    responses={
        400: {"detail": "Invalid status transition or user_id"},
        403: {"detail": "Archived project cannot be modified"},
        404: {"detail": "Project not found"}
    }
)
async def change_project_status(
    project_id: UUID,
    status_update: ProjectStatusUpdate,
    db: SessionDep
):
    result = await db.execute(select(Project).where(Project.project_id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.archived:
        raise HTTPException(status_code=403, detail="Archived project cannot be modified")
    if status_update.status not in ALLOWED_TRANSITIONS[project.status]:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status transition from {project.status} to {status_update.status}"
        )

    project.status = status_update.status
    if status_update.status == ProjectStatus.COMPLETED:
        project.completed_at = datetime.now(timezone.utc)

    history_entry = ProjectStatusHistory(
        project_id=project.project_id,
        status=status_update.status,
        changed_by=status_update.changed_by
    )
    db.add(history_entry)

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Invalid user_id"
        )
    return {"message": "Status updated successfully"}


# Отримання історії статусів проєкту
@router.get("/{project_id}/status-history", response_model=list[ProjectStatusResponse],
    responses={404: {"detail": "Project not found"}}
)
async def get_project_status_history(project_id: UUID, db: SessionDep, oldest_first: bool = False):
    result = await db.execute(select(Project).where(Project.project_id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    history_result = await db.execute(
        select(ProjectStatusHistory)
        .where(ProjectStatusHistory.project_id == project_id)
        .order_by(
            ProjectStatusHistory.changed_at.asc()
            if oldest_first
            else ProjectStatusHistory.changed_at.desc()
        )
    )
    return history_result.scalars().all()


# Архівація проєкту
@router.put("/{project_id}/archive",
    responses={404: {"detail": "Project not found"}}
)
async def archive_project(project_id: UUID, db: SessionDep):
    result = await db.execute(select(Project).where(Project.project_id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.archived = True
    await db.commit()
    return {"message": "Project archived successfully"}


# Видалення проєкту
@router.delete("/{project_id}",
    responses={404: {"detail": "Project not found"}}
)
async def delete_project(project_id: UUID, db: SessionDep):
    result = await db.execute(select(Project).where(Project.project_id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    await db.delete(project)
    await db.commit()
    return {"message": "Project deleted successfully"}
