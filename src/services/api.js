/**
 * ARCHON Construction Suite — Axios API service
 * Base URL resolves through the Nginx reverse proxy at /api/v1.
 *
 * Endpoints mirror every data set used in ArchonPreview:
 *  /stats        → ProjectStats
 *  /projects     → Project[]
 *  /tasks        → Task[]
 *  /documents    → Document[]
 *  /incidents    → Incident[]
 */

import axios from "axios";

// ── Instance ──────────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: "/api/v1",
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Attach JWT token when available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("archon_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// Normalise FastAPI `detail` error messages
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred.";
    return Promise.reject(new Error(message));
  },
);

// ── Stats ─────────────────────────────────────────────────────────────────────
/**
 * GET /stats
 * Returns the four dashboard counters shown in the Overview section.
 * @returns {Promise<import('../types').ProjectStats>}
 */
export const fetchProjectStats = () => api.get("/stats").then((r) => r.data);

// ── Projects ──────────────────────────────────────────────────────────────────
/**
 * GET /projects
 * Powers the Project Registry list on the Dashboard page.
 * @param {{ status?: string }} [params]
 * @returns {Promise<import('../types').Project[]>}
 */
export const fetchProjects = (params = {}) =>
  api.get("/projects", { params }).then((r) => r.data);

/**
 * GET /projects/:id
 * @param {string|number} id
 * @returns {Promise<import('../types').Project>}
 */
export const fetchProjectById = (id) =>
  api.get(`/projects/${id}`).then((r) => r.data);

/**
 * POST /projects
 * Called by the "Create New Project" form (name, location, budget fields).
 * @param {{ name: string, location: string, budget: number }} payload
 * @returns {Promise<import('../types').Project>}
 */
export const createProject = (payload) =>
  api.post("/projects", payload).then((r) => r.data);

/**
 * PATCH /projects/:id
 * @param {string|number} id
 * @param {Partial<import('../types').Project>} payload
 * @returns {Promise<import('../types').Project>}
 */
export const updateProject = (id, payload) =>
  api.patch(`/projects/${id}`, payload).then((r) => r.data);

/**
 * DELETE /projects/:id
 * @param {string|number} id
 */
export const deleteProject = (id) =>
  api.delete(`/projects/${id}`).then((r) => r.data);

// ── Tasks ─────────────────────────────────────────────────────────────────────
/**
 * GET /tasks
 * Powers the "Today's Tasks" list (text, status, done flag).
 * @param {{ projectId?: string|number }} [params]
 * @returns {Promise<import('../types').Task[]>}
 */
export const fetchTasks = (params = {}) =>
  api.get("/tasks", { params }).then((r) => r.data);

/**
 * PATCH /tasks/:id
 * Toggles the done flag or updates status from the Task List.
 * @param {string|number} id
 * @param {Partial<import('../types').Task>} payload
 * @returns {Promise<import('../types').Task>}
 */
export const updateTask = (id, payload) =>
  api.patch(`/tasks/${id}`, payload).then((r) => r.data);

/**
 * POST /tasks
 * Called by the "Add New Task" button on the Tasks page.
 * @param {{ text: string, status: import('../types').TaskStatus, projectId?: string|number }} payload
 * @returns {Promise<import('../types').Task>}
 */
export const createTask = (payload) =>
  api.post("/tasks", payload).then((r) => r.data);

// ── Documents ─────────────────────────────────────────────────────────────────
/**
 * GET /documents
 * Powers the Document cards grid and Document Versions list.
 * @param {{ type?: string, stableOnly?: boolean }} [params]
 * @returns {Promise<import('../types').Document[]>}
 */
export const fetchDocuments = (params = {}) =>
  api.get("/documents", { params }).then((r) => r.data);

/**
 * POST /documents  (multipart/form-data)
 * Called by the "Upload Files" button on the Documents page.
 * @param {FormData} formData
 * @returns {Promise<import('../types').Document>}
 */
export const uploadDocument = (formData) =>
  api
    .post("/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);

/**
 * GET /documents/:id/download
 * Triggers a file download; used by the per-version download buttons.
 * @param {string|number} id
 * @returns {Promise<Blob>}
 */
export const downloadDocument = (id) =>
  api
    .get(`/documents/${id}/download`, { responseType: "blob" })
    .then((r) => r.data);

// ── Incidents ─────────────────────────────────────────────────────────────────
/**
 * GET /incidents
 * Powers the Reported Incidents list (name, date, severity).
 * @param {{ projectId?: string|number }} [params]
 * @returns {Promise<import('../types').Incident[]>}
 */
export const fetchIncidents = (params = {}) =>
  api.get("/incidents", { params }).then((r) => r.data);

/**
 * POST /incidents
 * Called by the "+ Report Incident" button on the Incidents page.
 * @param {{ name: string, severity: import('../types').Severity, projectId?: string|number }} payload
 * @returns {Promise<import('../types').Incident>}
 */
export const createIncident = (payload) =>
  api.post("/incidents", payload).then((r) => r.data);

export default api;
