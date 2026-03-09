import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4
from decimal import Decimal
from datetime import datetime, timezone

from models import (
    ProjectStatus, TaskStatus,
    DocumentStatus, IncidentPriority, IncidentStatus,
)


def make_db():
    db = AsyncMock()
    db.add      = MagicMock()
    db.flush    = AsyncMock()
    db.commit   = AsyncMock()
    db.rollback = AsyncMock()
    db.refresh  = AsyncMock()
    db.delete   = AsyncMock()
    db.execute  = AsyncMock()
    return db


def scalar_result(value):
    r = MagicMock()
    r.scalar_one_or_none.return_value = value
    r.scalar.return_value = value
    return r


def scalars_result(values):
    r = MagicMock()
    r.scalars.return_value.all.return_value = values
    return r


def make_project(**kw):
    p = MagicMock()
    p.project_id     = kw.get("project_id",     uuid4())
    p.name           = kw.get("name",           "ЖК Грін")
    p.address        = kw.get("address",        "вул. Миру, 1")
    p.initial_budget = kw.get("initial_budget", Decimal("500.0"))
    p.status         = kw.get("status",         ProjectStatus.ACTIVE)
    p.created_at     = kw.get("created_at",     datetime.now(timezone.utc))
    p.completed_at   = kw.get("completed_at",   None)
    p.archived       = kw.get("archived",       False)
    p.created_by     = kw.get("created_by",     uuid4())
    return p


def make_task(**kw):
    t = MagicMock()
    t.task_id     = kw.get("task_id",     uuid4())
    t.project_id  = kw.get("project_id",  uuid4())
    t.title       = kw.get("title",       "Test Task")
    t.description = kw.get("description", None)
    t.deadline    = kw.get("deadline",    None)
    t.status      = kw.get("status",      TaskStatus.TODO)
    t.created_at  = kw.get("created_at",  datetime.now(timezone.utc))
    t.created_by  = kw.get("created_by",  uuid4())
    return t


def make_document(**kw):
    d = MagicMock()
    d.document_id = kw.get("document_id", uuid4())
    d.project_id  = kw.get("project_id",  uuid4())
    d.title       = kw.get("title",       "Test Doc")
    d.created_at  = kw.get("created_at",  datetime.now(timezone.utc))
    d.created_by  = kw.get("created_by",  uuid4())
    return d


def make_version(**kw):
    v = MagicMock()
    v.version_id     = kw.get("version_id",     uuid4())
    v.document_id    = kw.get("document_id",    uuid4())
    v.version_number = kw.get("version_number", 1)
    v.file_path      = kw.get("file_path",      "/var/lib/archon/files/plan_v1.pdf")
    v.uploaded_at    = kw.get("uploaded_at",    datetime.now(timezone.utc))
    v.status         = kw.get("status",         DocumentStatus.DRAFT)
    v.uploaded_by    = kw.get("uploaded_by",    uuid4())
    return v


def make_incident(**kw):
    i = MagicMock()
    i.incident_id = kw.get("incident_id", uuid4())
    i.project_id  = kw.get("project_id",  uuid4())
    i.title       = kw.get("title",       "Test Incident")
    i.description = kw.get("description", None)
    i.priority    = kw.get("priority",    IncidentPriority.MEDIUM)
    i.status      = kw.get("status",      IncidentStatus.OPEN)
    i.created_at  = kw.get("created_at",  datetime.now(timezone.utc))
    i.resolved_at = kw.get("resolved_at", None)
    i.created_by  = kw.get("created_by",  uuid4())
    return i


def make_upload_file(content_type="application/pdf", filename="plan_v2.pdf", content=b"data"):
    from fastapi import UploadFile
    f = MagicMock(spec=UploadFile)
    f.content_type = content_type
    f.filename     = filename
    f.read         = AsyncMock(return_value=content)
    return f
