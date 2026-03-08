/**
 * @fileoverview ARCHON Construction Suite — shared data types (JSDoc)
 *
 * Every typedef here maps 1-to-1 with the data shapes used in
 * ArchonPreview.jsx and the API endpoints in services/api.js.
 *
 * Migrate to TypeScript by converting each @typedef to an `interface`
 * and each string-union @typedef to a `type` alias.
 */

// ── Primitive unions ──────────────────────────────────────────────────────────

/**
 * Lifecycle stage of a project — drives the colour-coded status labels
 * in the Project Registry list on the Dashboard page.
 * @typedef {'Active'|'Approved'|'Denied'|'Pending'|'Done'} ProjectStatus
 */

/**
 * Lifecycle stage of a task — drives the pill badges in the Task List.
 * @typedef {'In Progress'|'Done'|'To Do'} TaskStatus
 */

/**
 * Severity level of a reported incident — drives the colour-coded badge
 * on the Incidents page.
 * @typedef {'Critical'|'Medium'|'Low'} Severity
 */

// ── Core models ───────────────────────────────────────────────────────────────

/**
 * Dashboard Overview counters — returned by GET /api/v1/stats and stored
 * in global state via StatsContext.
 *
 * @typedef {Object} ProjectStats
 * @property {number} total      - All projects in the system
 * @property {number} active     - Projects with status "Active" (in-progress)
 * @property {number} completed  - Projects with status "Done"
 * @property {number} pending    - Projects with status "Pending"
 */

/**
 * A single construction project — displayed in the Project Registry list
 * and created via the "Create New Project" form.
 *
 * @typedef {Object} Project
 * @property {string|number}  id        - Unique identifier (UUID or integer PK)
 * @property {string}         name      - Human-readable project name
 * @property {string}         location  - Site address shown below the project name
 * @property {ProjectStatus}  status    - Current lifecycle stage
 * @property {number}         budget    - Approved budget in USD
 * @property {string}         [icon]    - Optional emoji / URL for the thumbnail cell
 */

/**
 * A single task in the "Today's Tasks" list on the Tasks page.
 *
 * @typedef {Object} Task
 * @property {string|number} id      - Unique identifier
 * @property {string}        text    - Task description shown in the list row
 * @property {TaskStatus}    status  - Current status shown as a pill badge
 * @property {boolean}       done    - Whether the checkbox is checked
 */

/**
 * A document card shown in the Document Repository page.
 * Also used for individual version entries in the Document Versions grid.
 *
 * @typedef {Object} Document
 * @property {string|number} id        - Unique identifier
 * @property {string}        name      - Document title (e.g. "Project Plans")
 * @property {string}        uploader  - Display name of the uploader
 * @property {string}        date      - Upload date in YYYY-MM-DD format
 * @property {string}        [rev]     - Version label (e.g. "v2.1 — Final")
 * @property {string}        [note]    - Short description shown under the version label
 * @property {'stable'|'draft'} [status] - Version stability tag
 */

/**
 * A reported incident shown in the Incidents page list.
 *
 * @typedef {Object} Incident
 * @property {string|number} id        - Unique identifier
 * @property {string}        name      - Short description (e.g. "Broken equipment on site B")
 * @property {string}        date      - Display date (e.g. "Feb 20")
 * @property {Severity}      severity  - Criticality level
 */

// ── Context value shapes ──────────────────────────────────────────────────────

/**
 * Value exposed by <StatsProvider> and consumed via useStats().
 *
 * @typedef {Object} StatsContextValue
 * @property {ProjectStats|null} stats    - Latest fetched stats snapshot (null while loading)
 * @property {boolean}           loading  - True while the /stats request is in-flight
 * @property {string|null}       error    - Human-readable error message, or null
 * @property {() => void}        refresh  - Manually re-trigger the stats fetch
 */

// ── Helper constants ──────────────────────────────────────────────────────────

/** All valid project statuses — useful for <select> dropdowns. */
export const PROJECT_STATUSES = /** @type {ProjectStatus[]} */ ([
  "Active",
  "Approved",
  "Denied",
  "Pending",
  "Done",
]);

/** All valid task statuses. */
export const TASK_STATUSES = /** @type {TaskStatus[]} */ ([
  "In Progress",
  "Done",
  "To Do",
]);

/** All valid incident severity levels. */
export const SEVERITY_LEVELS = /** @type {Severity[]} */ ([
  "Critical",
  "Medium",
  "Low",
]);

export default {};
