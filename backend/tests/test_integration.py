import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from main import app
from database import get_session

# connecting to database
DB_URL = "postgresql+asyncpg://admin:password@localhost:5432/archondb"


# database session substitution
async def override_get_session():
    engine = create_async_engine(DB_URL)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session
    await engine.dispose()

app.dependency_overrides[get_session] = override_get_session


# cleaning tables
async def truncate_all():
    engine = create_async_engine(DB_URL)
    async with engine.connect() as conn:
        await conn.execute(text("""
            TRUNCATE TABLE
                incident,
                document_version,
                document,
                task_status_history,
                task,
                project_status_history,
                project,
                "user"
            RESTART IDENTITY CASCADE
        """))
        await conn.commit()
    await engine.dispose()


# helpers
def make_client():
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


async def create_user(client: AsyncClient) -> str:
    r = await client.post("/users", json={
        "email": "test@archon.com",
        "password_hash": "hashed",
        "role": "ENGINEER",
        "full_name": "Test User",
    })
    assert r.status_code == 201, r.text
    return r.json()


async def create_project(client: AsyncClient, user_id: str) -> str:
    r = await client.post("/projects", json={
        "name": "ЖК Грін",
        "address": "вул. Миру, 1",
        "initial_budget": 500.0,
        "created_by": user_id,
    })
    assert r.status_code == 201, r.text
    return r.json()



@pytest.mark.asyncio
async def test_TC01_create_project_success():
    await truncate_all()
    async with make_client() as client:
        user_id = await create_user(client)

        r = await client.post("/projects", json={
            "name": "ЖК Грін",
            "address": "вул. Миру, 1",
            "initial_budget": 500.0,
            "created_by": user_id,
        })

        assert r.status_code == 201
        assert r.json() is not None



@pytest.mark.asyncio
async def test_TC02_create_project_empty_address():
    await truncate_all()
    async with make_client() as client:
        user_id = await create_user(client)

        r = await client.post("/projects", json={
            "name": "Тест",
            "address": "",
            "initial_budget": 100.0,
            "created_by": user_id,
        })

        assert r.status_code == 422



@pytest.mark.asyncio
async def test_TC03_projects_sorted_by_created_at():
    await truncate_all()
    async with make_client() as client:
        user_id = await create_user(client)
        await create_project(client, user_id)
        await create_project(client, user_id)

        r = await client.get("/projects?sort=created_at")

        assert r.status_code == 200
        projects = r.json()
        assert len(projects) == 2
        assert projects[0]["created_at"] <= projects[1]["created_at"]



@pytest.mark.asyncio
async def test_TC04_project_approved_to_completed():
    await truncate_all()
    async with make_client() as client:
        user_id = await create_user(client)
        project_id = await create_project(client, user_id)

        for status in ["PENDING", "APPROVED", "COMPLETED"]:
            r = await client.put(f"/projects/{project_id}/status", json={
                "status": status,
                "changed_by": user_id,
            })
            assert r.status_code == 200, f"Не вдалось змінити статус на {status}: {r.text}"

        r = await client.get(f"/projects/{project_id}")
        assert r.status_code == 200
        assert r.json()["status"] == "COMPLETED"
        assert r.json()["completed_at"] is not None



@pytest.mark.asyncio
async def test_TC05_create_task_missing_deadline():
    await truncate_all()
    async with make_client() as client:
        user_id = await create_user(client)
        project_id = await create_project(client, user_id)

        r = await client.post("/tasks", json={
            "title": "Замір вікон",
            "project_id": project_id,
            "created_by": user_id,
            "deadline": "",
        })

        assert r.status_code == 422



@pytest.mark.asyncio
async def test_TC06_search_tasks_by_title():
    await truncate_all()
    async with make_client() as client:
        user_id = await create_user(client)
        project_id = await create_project(client, user_id)

        await client.post("/tasks", json={
            "title": "Закладення Фундаменту",
            "project_id": project_id,
            "created_by": user_id,
        })
        await client.post("/tasks", json={
            "title": "Монтаж перекриттів",
            "project_id": project_id,
            "created_by": user_id,
        })

        r = await client.get("/tasks/by-title/Фундамент")

        assert r.status_code == 200
        tasks = r.json()
        assert len(tasks) == 1
        assert "Фундамент" in tasks[0]["title"]



@pytest.mark.asyncio
async def test_TC07_get_task_details():
    await truncate_all()
    async with make_client() as client:
        user_id = await create_user(client)
        project_id = await create_project(client, user_id)

        r = await client.post("/tasks", json={
            "title": "Монтаж перекриттів",
            "description": "Детальний опис монтажу залізобетонних плит перекриття",
            "project_id": project_id,
            "created_by": user_id,
            "deadline": "2025-09-30",
        })
        assert r.status_code == 201, r.text
        task_id = r.json()

        r = await client.get(f"/tasks/{task_id}")
        assert r.status_code == 200
        task = r.json()

        assert task["title"]       == "Монтаж перекриттів"
        assert task["description"] == "Детальний опис монтажу залізобетонних плит перекриття"
        assert task["deadline"]    == "2025-09-30"
        assert task["status"]      == "TODO"



@pytest.mark.asyncio
async def test_TC08_task_status_changes():
    await truncate_all()
    async with make_client() as client:
        user_id = await create_user(client)
        project_id = await create_project(client, user_id)

        r = await client.post("/tasks", json={
            "title": "Тестова задача",
            "project_id": project_id,
            "created_by": user_id,
        })
        assert r.status_code == 201, r.text
        task_id = r.json()

        r = await client.put(f"/tasks/{task_id}/status", json={
            "status": "IN_PROGRESS",
            "changed_by": user_id,
        })
        assert r.status_code == 200, r.text
        r = await client.get(f"/tasks/{task_id}")
        assert r.json()["status"] == "IN_PROGRESS"

        r = await client.put(f"/tasks/{task_id}/status", json={
            "status": "DONE",
            "changed_by": user_id,
        })
        assert r.status_code == 200, r.text
        r = await client.get(f"/tasks/{task_id}")
        assert r.json()["status"] == "DONE"


@pytest.mark.asyncio
async def test_TC09_document_registry_fields():
    import io
    await truncate_all()
    async with make_client() as client:
        user_id = await create_user(client)
        project_id = await create_project(client, user_id)

        params = f"?title=Проєктна документація&project_id={project_id}&created_by={user_id}"
        r = await client.post(f"/documents{params}",
            files={"file": ("plan.pdf", io.BytesIO(b"content"), "application/pdf")}
        )
        assert r.status_code == 201, r.text

        r = await client.get("/documents")
        assert r.status_code == 200
        docs = r.json()

        assert len(docs) == 1
        assert docs[0]["title"]       == "Проєктна документація"
        assert docs[0]["created_by"]  == user_id
        assert docs[0]["document_id"] is not None
        assert docs[0]["created_at"]  is not None


@pytest.mark.asyncio
async def test_TC10_upload_new_document_version():
    import io
    await truncate_all()
    async with make_client() as client:
        user_id = await create_user(client)
        project_id = await create_project(client, user_id)

        params = f"?title=План&project_id={project_id}&created_by={user_id}"
        r = await client.post(f"/documents{params}",
            files={"file": ("plan_v1.pdf", io.BytesIO(b"v1"), "application/pdf")}
        )
        assert r.status_code == 201, r.text
        document_id = r.json()["document_id"]

        import json
        r = await client.post(f"/documents/{document_id}/versions",
            files={
                "file": ("plan_v2.pdf", io.BytesIO(b"v2"), "application/pdf"),
                "data": (None, json.dumps({"uploaded_by": user_id}), "application/json"),
            }
        )
        assert r.status_code == 200, r.text
        assert r.json()["version_number"] == 2

        r = await client.get(f"/documents/{document_id}")
        versions = r.json()["versions"]
        assert len(versions) == 2
        assert any(v["version_number"] == 1 for v in versions)
        assert any(v["version_number"] == 2 for v in versions)



@pytest.mark.asyncio
async def test_TC11_stable_version_uniqueness():
    import io
    await truncate_all()
    async with make_client() as client:
        user_id = await create_user(client)
        project_id = await create_project(client, user_id)


        params = f"?title=Проєктна документація&project_id={project_id}&created_by={user_id}&status=STABLE"
        r = await client.post(f"/documents{params}",
            files={"file": ("plan_v1.pdf", io.BytesIO(b"v1 content"), "application/pdf")}
        )
        assert r.status_code == 201, r.text
        document_id = r.json()["document_id"]

        import json
        r = await client.post(f"/documents/{document_id}/versions",
            files={
                "file": ("plan_v2.pdf", io.BytesIO(b"v2 content"), "application/pdf"),
                "data": (None, json.dumps({"uploaded_by": user_id, "status": "STABLE"}), "application/json"),
            }
        )
        assert r.status_code == 200, r.text

        r = await client.get(f"/documents/{document_id}")
        assert r.status_code == 200
        versions = r.json()["versions"]

        v1 = next(v for v in versions if v["version_number"] == 1)
        v2 = next(v for v in versions if v["version_number"] == 2)

        assert v2["status"] == "STABLE"
        assert v1["status"] == "ARCHIVE"



@pytest.mark.asyncio
async def test_TC12_create_critical_incident():
    await truncate_all()
    async with make_client() as client:
        user_id = await create_user(client)
        project_id = await create_project(client, user_id)

        r = await client.post("/incidents", json={
            "title": "Обвалення риштувань",
            "project_id": project_id,
            "created_by": user_id,
            "priority": "CRITICAL",
        })

        assert r.status_code == 201, r.text
        assert r.json() is not None 



@pytest.mark.asyncio
async def test_TC13_filter_incidents_by_high_priority():
    await truncate_all()
    async with make_client() as client:
        user_id = await create_user(client)
        project_id = await create_project(client, user_id)

        await client.post("/incidents", json={
            "title": "Витік води", "project_id": project_id,
            "created_by": user_id, "priority": "HIGH",
        })
        await client.post("/incidents", json={
            "title": "Дрібна тріщина", "project_id": project_id,
            "created_by": user_id, "priority": "LOW",
        })

        r = await client.get("/incidents?priority=HIGH")
        assert r.status_code == 200
        incidents = r.json()

        assert len(incidents) == 1
        assert incidents[0]["priority"] == "HIGH"
        assert incidents[0]["title"] == "Витік води"

        

@pytest.mark.asyncio
async def test_TC14_resolve_incident():
    await truncate_all()
    async with make_client() as client:
        user_id = await create_user(client)
        project_id = await create_project(client, user_id)

        r = await client.post("/incidents", json={
            "title": "Витік води",
            "project_id": project_id,
            "created_by": user_id,
            "priority": "HIGH",
        })
        assert r.status_code == 201, r.text
        incident_id = r.json()

        r = await client.put(f"/incidents/{incident_id}/status?status=RESOLVED")
        assert r.status_code == 200, r.text

        r = await client.get(f"/incidents/{incident_id}")
        assert r.json()["status"]      == "RESOLVED"
        assert r.json()["resolved_at"] is not None

        r = await client.delete(f"/incidents/{incident_id}")
        assert r.status_code == 200, r.text

        r = await client.get(f"/incidents/{incident_id}")
        assert r.status_code == 404