from uuid import UUID
from fastapi import APIRouter, HTTPException
from pydantic import EmailStr
from sqlalchemy import select

from database import SessionDep
from models import User
from schemas.users import UserCreate, UserUpdate, UserResponse


# -=-= КОРИСТУВАЧІ =-=-
router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# Отримати всіх користувачів
@router.get("", response_model=list[UserResponse])
async def get_all_users(db: SessionDep):
    result = await db.execute(select(User))
    users = result.scalars().all()
    return users


# Створити користувача
@router.post("", response_model=UUID, status_code=201)
async def create_user(user: UserCreate, db: SessionDep):
    db_user = User(**user.model_dump())
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user.user_id


# Отримати користувача за електронною поштою
@router.get("/by-email/{email}", response_model=UserResponse,
    responses={404: {"detail": "User not found"}}
)
async def get_user_by_email(email: EmailStr, db: SessionDep):
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# Отримати користувача за ID
@router.get("/{user_id}", response_model=UserResponse,
    responses={404: {"detail": "User not found"}}
)
async def get_user_by_id(user_id: UUID, db: SessionDep):
    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# Оновити дані користувача
@router.patch("/{user_id}",
    responses={404: {"detail": "User not found"}}
)
async def update_user_info(user_id: UUID, updates: UserUpdate, db: SessionDep):
    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    await db.commit()
    return {"message": "User updated successfully"}


# Видалити користувача
@router.delete("/{user_id}",
    responses={404: {"detail": "User not found"}}
)
async def delete_user(user_id: UUID, db: SessionDep):
    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(user)
    await db.commit()
    return {"message": "User deleted successfully"}
