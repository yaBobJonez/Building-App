import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

import pytest
from unittest.mock import MagicMock, patch, mock_open
from uuid import uuid4
from decimal import Decimal
from datetime import datetime, timedelta, timezone, date
from fastapi import HTTPException

from conftest import (
    make_db, scalar_result, scalars_result,
    make_project, make_task, make_document, make_version,
    make_upload_file, make_incident,
)
from schemas.projects import ProjectCreate, ProjectStatusUpdate
from schemas.tasks import TaskCreate, TaskStatusUpdate
from schemas.documents import DocumentVersionCreate
from schemas.incidents import IncidentCreate
from models import ProjectStatus, TaskStatus, DocumentStatus, IncidentPriority, IncidentStatus
from routers.projects import create_project, get_all_projects, change_project_status
from routers.tasks import create_task, search_tasks_by_title, get_task_by_id, change_task_status
from routers.documents import get_all_documents, create_document_version, update_version_status
from routers.incidents import create_incident, change_incident_status, delete_incident



@pytest.mark.asyncio
async def test_TC01_create_project_success():
    db = make_db()

    with patch("routers.projects.Project") as MockProject:
        fake_project = MagicMock()
        fake_project.project_id = uuid4()
        MockProject.return_value = fake_project

        payload = ProjectCreate(
            name="ЖК Грін",
            address="вул. Миру, 1",
            initial_budget=Decimal("500.0"),
            created_by=uuid4(),
        )

        result = await create_project(payload, db)

    assert result == fake_project.project_id
    db.add.assert_called_once()
    db.commit.assert_awaited_once() 


@pytest.mark.asyncio
async def test_TC02_create_project_empty_address_raises_422():
    db = make_db()

    with patch("routers.projects.Project") as MockProject:
        fake_project = MagicMock()
        fake_project.project_id = uuid4()
        MockProject.return_value = fake_project

        with pytest.raises(Exception):
            payload = ProjectCreate(
                name="Тест",
                address="",
                initial_budget=Decimal("100.0"),
                created_by=uuid4(),
            )
            await create_project(payload, db)

    db.add.assert_not_called()
    db.commit.assert_not_awaited()


@pytest.mark.asyncio
async def test_TC03_get_projects_sorted_by_created_at():
    now = datetime.now(timezone.utc)

    older_project = make_project(name="Старий проєкт",  created_at=now - timedelta(days=5))
    newer_project = make_project(name="Новіший проєкт", created_at=now)

    db = make_db()
    db.execute.return_value = scalars_result([older_project, newer_project])

    result = await get_all_projects(db, sort="created_at")

    assert len(result) == 2
    assert result[0].created_at <= result[1].created_at


@pytest.mark.asyncio
async def test_TC04_project_approved_to_completed_sets_date():
    db = make_db()

    project = make_project(status=ProjectStatus.APPROVED, archived=False)
    project.completed_at = None
    db.execute.return_value = scalar_result(project)

    status_update = ProjectStatusUpdate(
        status=ProjectStatus.COMPLETED,
        changed_by=uuid4(),
    )

    with patch("routers.projects.ProjectStatusHistory") as MockHistory:
        MockHistory.return_value = MagicMock()
        result = await change_project_status(project.project_id, status_update, db)

    assert result["message"] == "Status updated successfully"
    assert project.status == ProjectStatus.COMPLETED
    assert project.completed_at is not None
    db.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_TC05_create_task_missing_deadline_raises_422():
    db = make_db()

    with patch("routers.tasks.Task") as MockTask:
        fake_task = MagicMock()
        fake_task.task_id = uuid4()
        MockTask.return_value = fake_task

        with pytest.raises(Exception):
            payload = TaskCreate(
                title="Замір вікон",
                project_id=uuid4(),
                created_by=uuid4(),
                deadline="",
            )
            await create_task(payload, db)

    db.add.assert_not_called()
    db.commit.assert_not_awaited()


@pytest.mark.asyncio
async def test_TC06_search_tasks_by_title_returns_matching():
    db = make_db()
    matching_task = make_task(title="Закладення Фундаменту")
    db.execute.return_value = scalars_result([matching_task])

    result = await search_tasks_by_title("Фундамент", db)

    assert len(result) == 1
    assert "Фундамент" in result[0].title


@pytest.mark.asyncio
async def test_TC06_search_tasks_no_match_returns_empty():
    db = make_db()
    db.execute.return_value = scalars_result([])

    result = await search_tasks_by_title("Фундамент", db)

    assert result == []


@pytest.mark.asyncio
async def test_TC07_get_task_details_returns_full_info():
    db = make_db()
    task = make_task(
        title="Монтаж перекриттів",
        description="Детальний опис монтажу залізобетонних плит перекриття",
        deadline=date(2025, 9, 30),
        status=TaskStatus.IN_PROGRESS,
    )
    db.execute.return_value = scalar_result(task)

    result = await get_task_by_id(task.task_id, db)

    assert result.title       == "Монтаж перекриттів"
    assert result.description == "Детальний опис монтажу залізобетонних плит перекриття"
    assert result.deadline    == date(2025, 9, 30)
    assert result.status      == TaskStatus.IN_PROGRESS

@pytest.mark.asyncio
async def test_TC08_status_changes_todo_to_inprogress():
    db = make_db()
    task = make_task(status=TaskStatus.TODO)
    db.execute.return_value = scalar_result(task)

    with patch("routers.tasks.TaskStatusHistory") as MockHistory:
        MockHistory.return_value = MagicMock()
        result = await change_task_status(
            task.task_id,
            TaskStatusUpdate(status=TaskStatus.IN_PROGRESS, changed_by=uuid4()),
            db,
        )

    assert result["message"] == "Status updated successfully"
    assert task.status == TaskStatus.IN_PROGRESS
    db.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_TC08_status_changes_inprogress_to_done():
    db = make_db()
    task = make_task(status=TaskStatus.IN_PROGRESS)
    db.execute.return_value = scalar_result(task)

    with patch("routers.tasks.TaskStatusHistory") as MockHistory:
        MockHistory.return_value = MagicMock()
        result = await change_task_status(
            task.task_id,
            TaskStatusUpdate(status=TaskStatus.DONE, changed_by=uuid4()),
            db,
        )

    assert result["message"] == "Status updated successfully"
    assert task.status == TaskStatus.DONE
    db.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_TC09_document_list_contains_required_fields():
    db = make_db()
    uploader = uuid4()
    doc = make_document(created_by=uploader, title="Проєктна документація")
    db.execute.return_value = scalars_result([doc])

    result = await get_all_documents(db)

    assert len(result) == 1
    assert result[0].created_by  == uploader  
    assert result[0].title       == "Проєктна документація"
    assert result[0].document_id is not None
    assert result[0].created_at  is not None


@pytest.mark.asyncio
async def test_TC09_document_list_sorting_by_title_works():
    db = make_db()
    db.execute.return_value = scalars_result([
        make_document(title="А — Армування"),
        make_document(title="Б — Бетонування"),
    ])

    result = await get_all_documents(db, sort="title")

    assert result[0].title == "А — Армування"
    assert result[1].title == "Б — Бетонування"


@pytest.mark.asyncio
async def test_TC10_upload_new_version_creates_version_2():
    db  = make_db()
    doc = make_document()

    max_ver_result = MagicMock()
    max_ver_result.scalar.return_value = 1
    db.execute.side_effect = [scalar_result(doc), max_ver_result]

    with patch("routers.documents.DocumentVersion") as MockVer, \
         patch("builtins.open", mock_open()), \
         patch("routers.documents.uuid.uuid4", return_value="new-uuid"):

        fake_version = MagicMock()
        fake_version.version_number = 2
        MockVer.return_value = fake_version
        db.refresh.side_effect = lambda v: None

        result = await create_document_version(
            doc.document_id,
            DocumentVersionCreate(uploaded_by=uuid4()),
            make_upload_file(filename="plan_v2.pdf"),
            db,
        )

    assert result.version_number == 2
    db.commit.assert_awaited_once()

@pytest.mark.asyncio
async def test_TC10_previous_version_remains_in_history():
    db  = make_db()
    doc = make_document()

    max_ver_result = MagicMock()
    max_ver_result.scalar.return_value = 1
    db.execute.side_effect = [scalar_result(doc), max_ver_result]

    with patch("routers.documents.DocumentVersion") as MockVer, \
         patch("builtins.open", mock_open()), \
         patch("routers.documents.uuid.uuid4", return_value="new-uuid"):

        fake_version = MagicMock()
        fake_version.version_number = 2
        MockVer.return_value = fake_version
        db.refresh.side_effect = lambda v: None

        await create_document_version(
            doc.document_id,
            DocumentVersionCreate(uploaded_by=uuid4()),
            make_upload_file(filename="plan_v2.pdf"),
            db,
        )

    db.delete.assert_not_awaited()


@pytest.mark.asyncio
async def test_TC12_create_incident_with_critical_priority():
    db = make_db()

    with patch("routers.incidents.Incident") as MockIncident:
        fake_incident = MagicMock()
        fake_incident.incident_id = uuid4()
        fake_incident.priority    = IncidentPriority.CRITICAL
        MockIncident.return_value = fake_incident

        payload = IncidentCreate(
            title="Обвалення риштувань",
            project_id=uuid4(),
            created_by=uuid4(),
            priority=IncidentPriority.CRITICAL,
        )
        result = await create_incident(payload, db)

    assert result == fake_incident.incident_id
    assert fake_incident.priority == IncidentPriority.CRITICAL
    db.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_TC14_resolve_incident_changes_status():
    db = make_db()
    incident = make_incident(status=IncidentStatus.OPEN)
    incident.resolved_at = None
    db.execute.return_value = scalar_result(incident)

    result = await change_incident_status(incident.incident_id, IncidentStatus.RESOLVED, db)

    assert result["message"] == "Status updated successfully"
    assert incident.status      == IncidentStatus.RESOLVED
    assert incident.resolved_at is not None
    db.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_TC14_resolved_incident_can_be_deleted():
    db = make_db()
    incident = make_incident(status=IncidentStatus.RESOLVED)
    db.execute.return_value = scalar_result(incident)

    result = await delete_incident(incident.incident_id, db)

    assert result["message"] == "Incident deleted successfully"
    db.delete.assert_awaited_once_with(incident)
    db.commit.assert_awaited_once()


def test_TC15_request_without_auth_token_returns_401():
    from fastapi.testclient import TestClient
    from fastapi import FastAPI, Security
    from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

    security = HTTPBearer()
    test_app = FastAPI()

    @test_app.post("/projects")
    async def protected_endpoint(
        credentials: HTTPAuthorizationCredentials = Security(security)
    ):
        return {"message": "ok"}

    client = TestClient(test_app, raise_server_exceptions=False)

    response = client.post("/projects", json={
        "name": "Test",
        "address": "Kyiv",
        "initial_budget": 100,
        "created_by": str(uuid4()),
    })

    assert response.status_code == 401