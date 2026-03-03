CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role_enum AS ENUM ('ADMIN', 'MANAGER', 'ENGINEER');
CREATE TYPE project_status_enum AS ENUM ('ACTIVE', 'PENDING', 'APPROVED', 'DENIED', 'COMPLETED');
CREATE TYPE task_status_enum AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');
CREATE TYPE document_status_enum AS ENUM ('DRAFT', 'STABLE', 'ARCHIVED');
CREATE TYPE incident_priority_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE incident_status_enum AS ENUM ('OPEN', 'RESOLVED');
