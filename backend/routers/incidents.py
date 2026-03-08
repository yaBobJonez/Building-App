from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from database import SessionDep
from models import Incident, IncidentPriority, IncidentStatus
from schemas.incidents import IncidentCreate, IncidentUpdate, IncidentResponse


# -=-= ІНЦИДЕНТИ (ПРОБЛЕМИ) =-=-
router = APIRouter(
    prefix="/incidents",
    tags=["Incidents"]
)


# Отримати всі інциденти
@router.get("", response_model=list[IncidentResponse],
    responses={400: {"detail": "Invalid sort field"}}
)
async def get_all_incidents(
    db: SessionDep,
    project: UUID | None = None,
    priority: IncidentPriority | None = None,
    status: IncidentStatus | None = None,
    user: UUID | None = None,
    sort: str | None = None
):
    query = select(Incident)

    if project:
        query = query.where(Incident.project_id == project)
    if priority:
        query = query.where(Incident.priority == priority)
    if status:
        query = query.where(Incident.status == status)
    if user:
        query = query.where(Incident.created_by == user)

    if sort:
        if not hasattr(Incident, sort):
            raise HTTPException(status_code=400, detail="Invalid sort field")
        query = query.order_by(getattr(Incident, sort))

    result = await db.execute(query)
    return result.scalars().all()


# Створити інцидент
@router.post("", response_model=UUID, status_code=201,
    responses={400: {"detail": "Invalid project_id or user_id"}}
)
async def create_incident(incident: IncidentCreate, db: SessionDep):
    data = incident.model_dump()
    if data["priority"] is None:
        data.pop("priority")
    if data["status"] is None:
        data.pop("status")
    db_incident = Incident(**data)

    db.add(db_incident)
    try:
        await db.commit()
        await db.refresh(db_incident)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Invalid project_id or user_id"
        )
    return db_incident.incident_id


# Отримати інцидент за ID
@router.get("/{incident_id}", response_model=IncidentResponse,
    responses={404: {"detail": "Incident not found"}}
)
async def get_incident_by_id(incident_id: UUID, db: SessionDep):
    result = await db.execute(select(Incident).where(Incident.incident_id == incident_id))
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


# Пошук інцидентів за назвою
@router.get("/by-title/{title}", response_model=list[IncidentResponse])
async def search_incidents_by_title(title: str, db: SessionDep):
    result = await db.execute(
        select(Incident).where(Incident.title.ilike(f"%{title}%"))
    )
    return result.scalars().all()


# Оновити дані інциденту
@router.patch("/{incident_id}",
    responses={404: {"detail": "Incident not found"}}
)
async def update_incident(
    incident_id: UUID,
    updates: IncidentUpdate,
    db: SessionDep
):
    result = await db.execute(select(Incident).where(Incident.incident_id == incident_id))
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(incident, key, value)
    await db.commit()
    return {"message": "Incident updated successfully"}


# Зміна пріоритету інциденту
@router.put("/{incident_id}/priority",
    responses={404: {"detail": "Incident not found"}}
)
async def change_incident_priority(
    incident_id: UUID,
    priority: IncidentPriority,
    db: SessionDep
):
    result = await db.execute(select(Incident).where(Incident.incident_id == incident_id))
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.priority = priority
    await db.commit()
    return {"message": "Priority updated successfully"}


# Зміна статусу інциденту
@router.put("/{incident_id}/status",
    responses={404: {"detail": "Incident not found"}}
)
async def change_incident_status(
    incident_id: UUID,
    status: IncidentStatus,
    db: SessionDep
):
    result = await db.execute(select(Incident).where(Incident.incident_id == incident_id))
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.status = status
    incident.resolved_at = (
        datetime.now(timezone.utc)
        if status == IncidentStatus.RESOLVED
        else None
    )
    await db.commit()
    return {"message": "Status updated successfully"}


# Видалення інциденту
@router.delete("/{incident_id}",
    responses={404: {"detail": "Incident not found"}}
)
async def delete_incident(incident_id: UUID, db: SessionDep):
    result = await db.execute(select(Incident).where(Incident.incident_id == incident_id))
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    await db.delete(incident)
    await db.commit()
    return {"message": "Incident deleted successfully"}
