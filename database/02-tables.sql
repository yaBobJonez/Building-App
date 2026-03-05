CREATE TABLE "user" (
    user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email varchar(255) NOT NULL UNIQUE,
    password_hash text NOT NULL,
    full_name varchar(255),
    role user_role_enum NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE project (
    project_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    address text NOT NULL,
    initial_budget numeric(15,2) NOT NULL,
    status project_status_enum NOT NULL DEFAULT 'ACTIVE',
    created_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    archived boolean NOT NULL DEFAULT false,
    created_by uuid NOT NULL,
    FOREIGN KEY (created_by) REFERENCES "user"(user_id)
);

CREATE TABLE project_status_history (
    history_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL,
    status project_status_enum NOT NULL,
    changed_at timestamptz NOT NULL DEFAULT now(),
    changed_by uuid NOT NULL,
    FOREIGN KEY (project_id) REFERENCES project(project_id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES "user"(user_id)
);

CREATE TABLE task (
    task_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL,
    title varchar(255) NOT NULL,
    description text,
    deadline date,
    status task_status_enum NOT NULL DEFAULT 'TODO',
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid NOT NULL,
    FOREIGN KEY (project_id) REFERENCES project(project_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES "user"(user_id)
);

CREATE TABLE task_status_history (
    history_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid NOT NULL,
    status task_status_enum NOT NULL,
    changed_at timestamptz NOT NULL DEFAULT now(),
    changed_by uuid NOT NULL,
    FOREIGN KEY (task_id) REFERENCES task(task_id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES "user"(user_id)
);

CREATE TABLE document (
    document_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL,
    title varchar(255) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid NOT NULL,
    FOREIGN KEY (project_id) REFERENCES project(project_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES "user"(user_id)
);

CREATE TABLE document_version (
    version_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id uuid NOT NULL,
    version_number integer NOT NULL,
    file_path text NOT NULL,
    uploaded_at timestamptz NOT NULL DEFAULT now(),
    status document_status_enum NOT NULL,
    uploaded_by uuid NOT NULL,
    FOREIGN KEY (document_id) REFERENCES document(document_id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES "user"(user_id),
    UNIQUE (document_id, version_number)
);

CREATE TABLE incident (
    incident_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL,
    title varchar(255) NOT NULL,
    description text,
    priority incident_priority_enum NOT NULL DEFAULT 'MEDIUM',
    status incident_status_enum NOT NULL DEFAULT 'OPEN',
    created_at timestamptz NOT NULL DEFAULT now(),
    resolved_at timestamptz,
    created_by uuid NOT NULL,
    FOREIGN KEY (project_id) REFERENCES project(project_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES "user"(user_id)
);