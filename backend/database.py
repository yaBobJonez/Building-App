import os
from typing import Annotated
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from fastapi import Depends

DATABASE_URL = os.getenv("ARCHON_DB_URL", "postgresql+asyncpg://admin:password@localhost:5432/archondb")

engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def get_session():
    async with AsyncSessionLocal() as session:
        yield session

Base = declarative_base()
SessionDep = Annotated[AsyncSession, Depends(get_session)]
