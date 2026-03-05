from uuid import UUID
from datetime import date
from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from database import SessionDep
from models import Task, TaskStatus, TaskStatusHistory
from schemas.tasks import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskStatusUpdate,
    TaskStatusResponse
)


# -=-= ЗАДАЧІ =-=-
router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)


# Отримати всі задачі
@router.get("", response_model=list[TaskResponse],
    responses={400: {"detail": "Invalid sort field"}}
)
async def get_all_tasks(
    db: SessionDep,
    project: UUID | None = None,
    status: TaskStatus | None = None,
    deadline: date | None = None,
    user: UUID | None = None,
    sort: str | None = None
):
    query = select(Task)

    if project:
        query = query.where(Task.project_id == project)
    if status:
        query = query.where(Task.status == status)
    if deadline:
        query = query.where(Task.deadline == deadline)
    if user:
        query = query.where(Task.created_by == user)
    
    if sort:
        if not hasattr(Task, sort):
            raise HTTPException(status_code=400, detail="Invalid sort field")
        query = query.order_by(getattr(Task, sort))
    
    result = await db.execute(query)
    return result.scalars().all()


# Створити задачу
@router.post("", response_model=UUID, status_code=201,
    responses={400: {"detail": "Invalid project_id or user_id"}}
)
async def create_task(task: TaskCreate, db: SessionDep):
    data = task.model_dump()
    if data["status"] is None:
        data.pop("status")
    db_task = Task(**data)
    db.add(db_task)
    try:
        await db.commit()
        await db.refresh(db_task)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Invalid project_id or user_id")
    return db_task.task_id


# Отримати задачу за ID
@router.get("/{task_id}", response_model=TaskResponse,
    responses={404: {"detail": "Task not found"}}
)
async def get_task_by_id(task_id: UUID, db: SessionDep):
    result = await db.execute(select(Task).where(Task.task_id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


# Пошук задач за назвою
@router.get("/by-title/{title}", response_model=list[TaskResponse])
async def search_tasks_by_title(title: str, db: SessionDep):
    result = await db.execute(
        select(Task).where(Task.title.ilike(f"%{title}%"))
    )
    return result.scalars().all()


# Оновити дані задачі
@router.patch("/{task_id}",
    responses={404: {"detail": "Task not found"}}
)
async def update_task(task_id: UUID, updates: TaskUpdate, db: SessionDep):
    result = await db.execute(select(Task).where(Task.task_id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
    await db.commit()
    return {"message": "Task updated successfully"}


# Зміна статусу задачі
@router.put("/{task_id}/status",
    responses={
        400: {"detail": "Invalid user_id"},
        404: {"detail": "Task not found"}
    }
)
async def change_task_status(
    task_id: UUID,
    status_update: TaskStatusUpdate,
    db: SessionDep
):
    result = await db.execute(select(Task).where(Task.task_id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = status_update.status

    history_entry = TaskStatusHistory(
        task_id=task.task_id,
        status=status_update.status,
        changed_by=status_update.changed_by
    )
    db.add(history_entry)

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Invalid user_id")
    return {"message": "Status updated successfully"}


# Отримання історії статусів задачі
@router.get("/{task_id}/status-history", response_model=list[TaskStatusResponse],
    responses={404: {"detail": "Task not found"}}
)
async def get_task_status_history(
    task_id: UUID,
    db: SessionDep,
    oldest_first: bool = False
):
    result = await db.execute(select(Task).where(Task.task_id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    history_result = await db.execute(
        select(TaskStatusHistory)
        .where(TaskStatusHistory.task_id == task_id)
        .order_by(
            TaskStatusHistory.changed_at.asc()
            if oldest_first
            else TaskStatusHistory.changed_at.desc()
        )
    )
    return history_result.scalars().all()


# Видалення задачі
@router.delete("/{task_id}",
    responses={404: {"detail": "Task not found"}}
)
async def delete_task(task_id: UUID, db: SessionDep):
    result = await db.execute(select(Task).where(Task.task_id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    await db.delete(task)
    await db.commit()
    return {"message": "Task deleted successfully"}
