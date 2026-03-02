import React from "react";
import { useState, useRef } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --black:#000000; --white:#FFFFFF; --mid:#C4C4C4;
    --light:#F5F5F5; --border:#E0E0E0; --text:#1A1A1A; --sub:#666666;
    --font:'Public Sans','Helvetica Neue',Arial,sans-serif;
  }
  body { background:var(--white); color:var(--text); font-family:var(--font); font-size:14px; }
  .app { display:flex; min-height:100vh; }

  /* Sidebar */
  .sidebar { width:180px; min-width:180px; background:#F0F0F0; border-right:1px solid var(--border); display:flex; flex-direction:column; flex-shrink:0; }
  .sidebar-logo { display:flex; align-items:center; gap:8px; padding:18px 16px; border-bottom:1px solid var(--border); }
  .logo-icon { width:32px; height:32px; background:var(--black); display:flex; align-items:center; justify-content:center; font-size:13px; color:var(--white); font-weight:800; }
  .logo-text { font-size:11px; font-weight:700; }
  .logo-sub { font-size:9px; color:var(--sub); }
  .sidebar-nav { padding:12px 0; flex:1; }
  .nav-item { display:flex; align-items:center; gap:10px; padding:9px 16px; font-size:12px; font-weight:500; color:var(--sub); cursor:pointer; border:none; background:none; width:100%; text-align:left; transition:background .15s,color .15s; }
  .nav-item:hover { background:#E5E5E5; color:var(--text); }
  .nav-item.active { background:#E0E0E0; color:var(--black); font-weight:600; }
  .nav-icon { font-size:13px; width:16px; text-align:center; }

  /* Top bar */
  .topbar { height:48px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:0 28px; background:var(--white); flex-shrink:0; }
  .topbar-title { font-size:13px; font-weight:700; letter-spacing:.02em; }
  .topbar-right { display:flex; align-items:center; gap:14px; }
  .topbar-nav { display:flex; gap:18px; }
  .topbar-nav-item { font-size:12px; color:var(--sub); cursor:pointer; background:none; border:none; font-family:var(--font); padding:0; transition:color .15s; }
  .topbar-nav-item:hover,.topbar-nav-item.active { color:var(--text); font-weight:600; }
  .search-box { display:flex; align-items:center; gap:6px; border:1px solid var(--border); padding:4px 10px; font-size:11px; color:var(--sub); border-radius:2px; background:var(--light); }
  .avatar { width:28px; height:28px; border-radius:50%; background:var(--mid); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:var(--white); }

  /* Content */
  .content { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
  .page { flex:1; overflow-y:auto; padding:32px 40px 60px; }

  /* Typography */
  .page-heading { font-size:22px; font-weight:800; letter-spacing:-.02em; text-align:center; margin-bottom:6px; }
  .page-sub { font-size:12px; color:var(--sub); text-align:center; margin-bottom:20px; }
  .section-header { text-align:center; margin-bottom:20px; }
  .section-with-btn { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }

  /* Buttons */
  .btn { font-family:var(--font); font-size:11px; font-weight:600; letter-spacing:.04em; cursor:pointer; padding:8px 18px; border-radius:2px; border:1px solid var(--black); transition:background .15s,color .15s; }
  .btn-primary { background:var(--black); color:var(--white); }
  .btn-primary:hover { background:#222; }
  .btn-outline { background:var(--white); color:var(--black); }
  .btn-outline:hover { background:var(--light); }
  .btn-sm { padding:5px 12px; font-size:10px; }
  .center-btn { display:flex; justify-content:center; margin-bottom:24px; }
  .divider { border:none; border-top:1px solid var(--border); margin:24px 0; }

  /* Project list */
  .project-list { max-width:520px; margin:0 auto 32px; }
  .project-item { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border:1px solid var(--border); margin-bottom:6px; background:var(--white); transition:box-shadow .15s; }
  .project-item:hover { box-shadow:0 2px 8px rgba(0,0,0,.07); }
  .project-item-left { display:flex; align-items:center; gap:12px; }
  .project-thumb { width:36px; height:36px; background:#EEE; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; border:1px solid var(--border); }
  .project-name { font-size:12px; font-weight:600; }
  .project-loc { font-size:10px; color:var(--sub); margin-top:1px; }
  .status-label { font-size:11px; font-weight:600; }
  .status-label.Active { color:#18A558; }
  .status-label.Approved { color:#1976D2; }
  .status-label.Denied { color:#D32F2F; }
  .status-label.Pending { color:#F57C00; }
  .status-label.Done { color:var(--sub); }
  .status-icon { font-size:12px; color:var(--mid); cursor:pointer; margin-left:6px; }

  /* Quick access */
  .quick-access-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; max-width:560px; margin:0 auto 32px; }
  .qa-card { border:1px solid var(--border); padding:20px 16px 14px; display:flex; flex-direction:column; align-items:center; gap:8px; cursor:pointer; transition:box-shadow .15s,border-color .15s; text-align:center; }
  .qa-card:hover { box-shadow:0 2px 10px rgba(0,0,0,.08); border-color:var(--mid); }
  .qa-icon { font-size:26px; margin-bottom:4px; }
  .qa-title { font-size:12px; font-weight:700; }
  .qa-desc { font-size:10px; color:var(--sub); line-height:1.4; }

  /* Stats */
  .stats-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:20px; max-width:400px; margin:0 auto 32px; }
  .stat-label { font-size:10px; color:var(--sub); font-weight:600; letter-spacing:.05em; text-transform:uppercase; margin-bottom:4px; }
  .stat-num { font-size:30px; font-weight:900; letter-spacing:-.03em; line-height:1; }
  .stat-change { font-size:10px; color:var(--sub); margin-top:2px; }

  /* Create form */
  .create-form { max-width:560px; margin:0 auto; }
  .form-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; margin-bottom:14px; }
  .form-group { display:flex; flex-direction:column; gap:4px; }
  .form-label { font-size:10px; font-weight:600; color:var(--text); text-transform:uppercase; letter-spacing:.05em; }
  .form-input { border:1px solid var(--border); padding:8px 10px; font-family:var(--font); font-size:12px; color:var(--text); border-radius:1px; outline:none; background:var(--white); transition:border-color .15s; }
  .form-input:focus { border-color:var(--black); }
  .form-input::placeholder { color:#BBB; }
  .form-actions { display:flex; gap:10px; margin-top:4px; }

  /* Tasks */
  .tasks-container { max-width:480px; margin:0 auto; }
  .task-filters { display:flex; gap:8px; margin-bottom:20px; }
  .task-item { display:flex; align-items:center; justify-content:space-between; padding:13px 0; border-bottom:1px solid var(--border); }
  .task-left { display:flex; align-items:center; gap:12px; }
  .task-check { width:20px; height:20px; border:2px solid var(--black); display:flex; align-items:center; justify-content:center; flex-shrink:0; cursor:pointer; background:var(--white); position:relative; }
  .task-check.done { background:var(--black); }
  .task-check.done::after { content:'✓'; color:var(--white); font-size:11px; font-weight:700; position:absolute; }
  .task-text { font-size:13px; font-weight:500; }
  .task-text.done { text-decoration:line-through; color:var(--sub); }
  .task-status-pill { font-size:10px; font-weight:600; padding:3px 9px; border:1px solid var(--border); border-radius:20px; color:var(--sub); white-space:nowrap; }
  .task-status-pill.inprogress { color:#1976D2; border-color:#1976D2; }
  .task-status-pill.done-pill { color:#18A558; border-color:#18A558; }
  .work-details { border:1px solid var(--border); padding:18px; display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-top:16px; }
  .work-title { font-size:13px; font-weight:700; margin-bottom:6px; }
  .work-items { font-size:11px; color:var(--sub); line-height:1.8; }
  .work-meta { font-size:10px; color:var(--mid); margin-top:4px; }

  /* Documents */
  .docs-container { max-width:680px; margin:0 auto; }
  .doc-cards-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
  .doc-card { border:1px solid var(--border); padding:16px 12px; display:flex; flex-direction:column; align-items:center; gap:6px; text-align:center; }
  .doc-file-icon { font-size:30px; color:var(--mid); }
  .doc-name { font-size:11px; font-weight:700; }
  .doc-uploader { font-size:10px; color:var(--sub); }
  .doc-date { font-size:10px; color:var(--sub); font-weight:600; }
  .filter-row { display:flex; align-items:center; gap:10px; margin-bottom:12px; flex-wrap:wrap; }
  .filter-toggle { font-family:var(--font); font-size:10px; font-weight:600; padding:4px 12px; border:1px solid var(--border); cursor:pointer; background:var(--white); border-radius:1px; transition:background .15s; }
  .filter-toggle.active { background:var(--black); color:var(--white); border-color:var(--black); }
  .version-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:12px; }
  .version-card { border:1px solid var(--border); padding:12px 14px; display:flex; align-items:flex-start; justify-content:space-between; gap:10px; }
  .version-left { display:flex; gap:10px; align-items:flex-start; }
  .ver-icon { font-size:22px; color:var(--mid); flex-shrink:0; margin-top:2px; }
  .ver-name { font-size:12px; font-weight:700; margin-bottom:2px; }
  .ver-meta { font-size:10px; color:var(--sub); line-height:1.5; }
  .ver-status { font-size:9px; font-weight:600; color:var(--sub); text-transform:uppercase; letter-spacing:.05em; }
  .download-btn { width:28px; height:28px; background:var(--black); border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; color:var(--white); font-size:14px; transition:background .15s; }
  .download-btn:hover { background:#333; }

  /* Incidents */
  .incidents-container { max-width:560px; margin:0 auto; }
  .incident-item { display:flex; align-items:center; justify-content:space-between; padding:14px 0; border-bottom:1px solid var(--border); gap:12px; }
  .incident-left { display:flex; align-items:center; gap:10px; }
  .incident-warn { font-size:18px; color:#F57C00; }
  .incident-name { font-size:13px; font-weight:600; }
  .incident-date { font-size:11px; color:var(--sub); text-align:right; }
  .severity-badge { font-size:10px; font-weight:700; text-align:right; }
  .severity-badge.critical { color:#D32F2F; }
  .severity-badge.medium { color:#F57C00; }

  /* Footer */
  .footer { border-top:1px solid var(--border); padding:14px 40px; display:flex; align-items:center; justify-content:space-between; font-size:10px; color:var(--sub); flex-shrink:0; }
  .footer-links { display:flex; gap:16px; }
  .footer-links a { color:var(--sub); text-decoration:none; }
  .footer-links a:hover { color:var(--text); }
`;

const PROJECTS = [
  {
    id: 1,
    name: 'KK "Sunny Tower"',
    loc: "Kyiv",
    status: "Active",
    icon: "🏗️",
  },
  { id: 2, name: "Warehouse A", loc: "Lviv", status: "Approved", icon: "🏭" },
  {
    id: 3,
    name: 'KK "Cloud Tower"',
    loc: "Dnipro",
    status: "Denied",
    icon: "🏗️",
  },
  { id: 4, name: "Warehouse B", loc: "Odesa", status: "Pending", icon: "🏭" },
  {
    id: 5,
    name: 'KK "Rainy Tower"',
    loc: "Kharkiv",
    status: "Done",
    icon: "🏗️",
  },
];

const TASKS_DATA = [
  {
    id: 1,
    text: "Pour concrete foundation",
    status: "In Progress",
    done: false,
  },
  { id: 2, text: "Site preparation", status: "Done", done: true },
  { id: 3, text: "Wall construction", status: "To Do", done: false },
];

const DOCS = [
  { name: "Project Plans", uploader: "John Smith", date: "2025-10-15" },
  { name: "Site Reports", uploader: "Jane Smith", date: "2025-10-10" },
  {
    name: "Inspection Certificates",
    uploader: "Mike Wayne",
    date: "2025-09-30",
  },
  { name: "Contracts", uploader: "Sarah Lyon", date: "2025-08-25" },
];

const VERSIONS = [
  {
    name: "Project Plans",
    rev: "v2.1 — Final",
    note: "Latest version available for download.",
    status: "stable",
  },
  {
    name: "Site Reports",
    rev: "v1.5 — Draft",
    note: "This version is a draft, not for use.",
    status: "draft",
  },
  {
    name: "Inspection Certificates",
    rev: "v1.0 — Stable",
    note: "Latest version available for stakeholder data.",
    status: "stable",
  },
  {
    name: "Contracts",
    rev: "v1.3 — Draft",
    note: "This version is a draft, not for use.",
    status: "draft",
  },
];

const INCIDENTS = [
  {
    id: 1,
    name: "Broken equipment on site B",
    date: "Feb 20",
    severity: "Critical",
  },
  { id: 2, name: "Weather delay alert", date: "Feb 19", severity: "Medium" },
];

/* ── Shell ────────────────────────────────────────────────────────────────── */
function AppShell({ page, setPage }) {
  const SIDEBAR_NAV = [
    { key: "dashboard", label: "Dashboard", icon: "⊞" },
    { key: "projects", label: "Projects", icon: "📁" },
    { key: "analytics", label: "Analytics", icon: "📊" },
    { key: "settings", label: "Settings", icon: "⚙️" },
  ];
  const TITLES = {
    dashboard: "Construction Dashboard",
    projects: "Project Tasks",
    tasks: "Project Tasks",
    documents: "Document Repository",
    incidents: "Project Incidents",
  };
  const SUB_NAV = ["Home", "Tasks", "Documents", "Incidents"];
  const inSub = ["projects", "tasks", "documents", "incidents"].includes(page);

  return (
    <div className="app">
      {page === "dashboard" && (
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-icon">🏗</div>
            <div>
              <div className="logo-text">TechBuild</div>
              <div className="logo-sub">Construction Suite</div>
            </div>
          </div>
          <nav className="sidebar-nav">
            {SIDEBAR_NAV.map((n) => (
              <button
                key={n.key}
                className={`nav-item${page === n.key ? " active" : ""}`}
                onClick={() => setPage(n.key)}
              >
                <span className="nav-icon">{n.icon}</span>
                {n.label}
              </button>
            ))}
          </nav>
        </aside>
      )}

      <div className="content">
        <div className="topbar">
          <div className="topbar-title">{TITLES[page] || "ARCHON"}</div>
          <div className="topbar-right">
            {inSub && (
              <nav className="topbar-nav">
                {SUB_NAV.map((l) => (
                  <button
                    key={l}
                    className={`topbar-nav-item${(l === "Home" && page === "projects") || (l === "Tasks" && page === "tasks") || (l === "Documents" && page === "documents") || (l === "Incidents" && page === "incidents") ? " active" : ""}`}
                    onClick={() => {
                      if (l === "Home") setPage("dashboard");
                      if (l === "Tasks") setPage("tasks");
                      if (l === "Documents") setPage("documents");
                      if (l === "Incidents") setPage("incidents");
                    }}
                  >
                    {l}
                  </button>
                ))}
              </nav>
            )}
            <div className="search-box">🔍 Search in site</div>
            <div className="avatar">U</div>
          </div>
        </div>

        {page === "dashboard" && <DashboardPage setPage={setPage} />}
        {page === "projects" && <TasksPage />}
        {page === "tasks" && <TasksPage />}
        {page === "documents" && <DocumentsPage />}
        {page === "incidents" && <IncidentsPage />}

        <footer className="footer">
          <span>© 2026 TechBuild</span>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ── Dashboard ────────────────────────────────────────────────────────────── */
function DashboardPage({ setPage }) {
  const [form, setForm] = useState({ name: "", address: "", budget: "" });
  return (
    <div className="page">
      <div className="section-header">
        <h1 className="page-heading">Construction Projects</h1>
      </div>
      <div className="center-btn">
        <button
          className="btn btn-primary"
          onClick={() => {
            const el = document.getElementById("create-project-section");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          + New Project
        </button>
      </div>

      <div
        style={{
          maxWidth: 520,
          margin: "0 auto 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2>Project Registry</h2>
      </div>
      <div className="project-list">
        {PROJECTS.map((p) => (
          <div className="project-item" key={p.id}>
            <div className="project-item-left">
              <div className="project-thumb">{p.icon}</div>
              <div>
                <div className="project-name">{p.name}</div>
                <div className="project-loc">{p.loc}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span className={`status-label ${p.status}`}>{p.status}</span>
              <span className="status-icon">ℹ</span>
            </div>
          </div>
        ))}
      </div>

      <hr className="divider" />

      <div className="section-header">
        <h2>Quick Access</h2>
      </div>
      <div className="quick-access-grid">
        {[
          {
            key: "tasks",
            icon: "📋",
            title: "Tasks",
            desc: "Manage tasks for this project",
          },
          {
            key: "documents",
            icon: "📄",
            title: "Docs",
            desc: "Access project documentation",
          },
          {
            key: "incidents",
            icon: "⚠️",
            title: "Incidents",
            desc: "Report or view incidents",
          },
        ].map((c) => (
          <div className="qa-card" key={c.key} onClick={() => setPage(c.key)}>
            <div className="qa-icon">{c.icon}</div>
            <div className="qa-title">{c.title}</div>
            <div className="qa-desc">{c.desc}</div>
          </div>
        ))}
      </div>

      <hr className="divider" />

      <div className="section-header">
        <h2>Overview</h2>
        <p className="page-sub" style={{ marginBottom: 0 }}>
          Key metrics on project status.
        </p>
      </div>
      <div className="stats-grid">
        <div>
          <div className="stat-label">Total Projects</div>
          <div className="stat-num">3</div>
        </div>
        <div>
          <div className="stat-label">Completed</div>
          <div className="stat-num">1</div>
          <div className="stat-change">+1</div>
        </div>
        <div>
          <div className="stat-label">In Progress</div>
          <div className="stat-num">1</div>
          <div className="stat-change">0</div>
        </div>
        <div>
          <div className="stat-label">Pending</div>
          <div className="stat-num">1</div>
          <div className="stat-change">0</div>
        </div>
      </div>

      <hr className="divider" />

      <div id="create-project-section" className="section-header">
        <h2>Create New Project</h2>
      </div>
      <div className="create-form">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input
              className="form-input"
              placeholder="Enter project name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Site Address</label>
            <input
              className="form-input"
              placeholder="Enter site address"
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
            />
          </div>
          <div className="form-group">
            <label className="form-label">Initial Budget</label>
            <input
              className="form-input"
              placeholder="Enter budget amount"
              value={form.budget}
              onChange={(e) =>
                setForm((f) => ({ ...f, budget: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="form-actions">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setForm({ name: "", address: "", budget: "" })}
          >
            Cancel
          </button>
          <button className="btn btn-primary btn-sm">Create</button>
        </div>
      </div>
    </div>
  );
}

/* ── Tasks ────────────────────────────────────────────────────────────────── */
function TasksPage() {
  const [tasks, setTasks] = useState(TASKS_DATA);
  const toggle = (id) =>
    setTasks((ts) =>
      ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  return (
    <div className="page">
      <div className="section-header">
        <h1 className="page-heading">Today's Tasks</h1>
        <p className="page-sub">Keep track of all your engineering tasks</p>
      </div>
      <div className="tasks-container">
        <div className="task-filters">
          <button className="btn btn-outline btn-sm">Filter Tasks</button>
          <button className="btn btn-primary btn-sm">Add New Task</button>
        </div>
        <h2 style={{ marginBottom: 14 }}>Task List</h2>
        <div>
          {tasks.map((t) => (
            <div className="task-item" key={t.id}>
              <div className="task-left">
                <div
                  className={`task-check${t.done ? " done" : ""}`}
                  onClick={() => toggle(t.id)}
                />
                <span className={`task-text${t.done ? " done" : ""}`}>
                  {t.text}
                </span>
              </div>
              <span
                className={`task-status-pill${t.status === "In Progress" ? " inprogress" : t.status === "Done" ? " done-pill" : ""}`}
              >
                {t.status}
              </span>
            </div>
          ))}
        </div>
        <div className="work-details">
          <div>
            <div className="work-title">Work Details</div>
            <div
              style={{ fontSize: 11, color: "var(--sub)", marginBottom: 12 }}
            >
              Summary of completed works
            </div>
            <button className="btn btn-primary btn-sm">Verify</button>
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 24 }}>🕐</span>
              <div className="work-title">Recent Work</div>
            </div>
            <div className="work-items">
              1. Concrete poured on 2025-10-07
              <br />
              2. Framework assembled on 2024-10-12
            </div>
            <div className="work-meta" style={{ marginTop: 6 }}>
              Established · Reviewed
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Documents ────────────────────────────────────────────────────────────── */
function DocumentsPage() {
  const [filter, setFilter] = useState("All");
  return (
    <div className="page">
      <div className="section-header">
        <h1 className="page-heading">Upload Your Documents</h1>
        <p className="page-sub">
          Easily manage and upload documents within the construction app.
        </p>
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 10 }}
        >
          <button className="btn btn-primary">Upload Files</button>
        </div>
      </div>
      <div className="docs-container">
        <hr className="divider" style={{ margin: "18px 0" }} />
        <div className="section-header">
          <h2>Documents</h2>
          <p className="page-sub" style={{ marginBottom: 0 }}>
            Your upload history and available documents.
          </p>
        </div>
        <div className="doc-cards-grid">
          {DOCS.map((d) => (
            <div className="doc-card" key={d.name}>
              <div className="doc-file-icon">📄</div>
              <div className="doc-name">{d.name}</div>
              <div className="doc-uploader">Uploaded by {d.uploader}</div>
              <div className="doc-date">{d.date}</div>
            </div>
          ))}
        </div>
        <hr className="divider" style={{ margin: "18px 0" }} />
        <h2 style={{ marginBottom: 14 }}>Filter Documents</h2>
        <div className="filter-row">
          {["All", "Certified Stable Versions"].map((f) => (
            <button
              key={f}
              className={`filter-toggle${filter === f ? " active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "10px 0 24px",
          }}
        >
          <button className="btn btn-primary btn-sm">Apply Filter</button>
        </div>
        <h2 style={{ marginBottom: 14 }}>Document Versions</h2>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 14,
          }}
        >
          <button className="btn btn-primary btn-sm">Download All</button>
        </div>
        <div className="version-grid">
          {VERSIONS.map((v) => (
            <div className="version-card" key={v.name}>
              <div className="version-left">
                <span className="ver-icon">📄</span>
                <div>
                  <div className="ver-name">{v.name}</div>
                  <div className="ver-meta">{v.rev}</div>
                  <div className="ver-meta">{v.note}</div>
                  <div className="ver-status">{v.status}</div>
                </div>
              </div>
              <button className="download-btn">↓</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Incidents ────────────────────────────────────────────────────────────── */
function IncidentsPage() {
  return (
    <div className="page">
      <div className="section-header">
        <h1 className="page-heading">Incidents Tab</h1>
        <p className="page-sub">
          Overview of reported incidents related to this project.
        </p>
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 10 }}
        >
          <button className="btn btn-primary">+ Report Incident</button>
        </div>
      </div>
      <div className="incidents-container">
        <div className="section-with-btn" style={{ marginTop: 16 }}>
          <h2>Reported Incidents</h2>
        </div>
        {INCIDENTS.map((inc) => (
          <div className="incident-item" key={inc.id}>
            <div className="incident-left">
              <span className="incident-warn">⚠</span>
              <span className="incident-name">{inc.name}</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="incident-date">{inc.date}</div>
              <div className={`severity-badge ${inc.severity.toLowerCase()}`}>
                — {inc.severity}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Root ─────────────────────────────────────────────────────────────────── */
export default function ArchonPreview() {
  const [page, setPage] = useState("dashboard");
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <AppShell page={page} setPage={setPage} />
    </>
  );
}
/*
export default function App() {
  const [page, setPage] = useState("dashboard");
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <AppShell page={page} setPage={setPage} />
    </>
  );
}
  */
