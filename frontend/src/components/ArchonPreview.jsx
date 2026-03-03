import React, { useState, useRef, createContext, useContext } from "react";
import {
  LayoutDashboard,
  Layers,
  BarChart3,
  Settings,
  Search,
  ChevronRight,
  AlertTriangle,
  FileText,
  CheckSquare,
  Clock,
  Info,
  CheckCircle2,
  XCircle,
  Download,
  X,
  Loader2,
  Calendar,
  Save,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";

// Контекст для керування станом
const AppContext = createContext();

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;800&display=swap');
  :root {
    --font:'Public Sans','Helvetica Neue',Arial,sans-serif;
  }
  body { font-family:var(--font); background-color: #ffffff; color: #1a1a1a; margin: 0; }
  
  .status-label { font-size:10px; font-weight:700; display: flex; align-items: center; gap: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
  
  .input-field { border: 1px solid #e5e7eb; padding: 10px 12px; border-radius: 2px; font-size: 12px; width: 100%; transition: border-color 0.2s; background: white; }
  .input-field:focus { border-color: #000; outline: none; }

  .btn-black { background: #000; color: #fff; font-size: 10px; font-weight: 700; padding: 10px 20px; border-radius: 2px; text-transform: uppercase; letter-spacing: 0.05em; transition: opacity 0.2s; cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .btn-black:hover { opacity: 0.8; }
  
  .btn-outline { border: 1px solid #e5e7eb; color: #000; font-size: 10px; font-weight: 700; padding: 10px 20px; border-radius: 2px; text-transform: uppercase; letter-spacing: 0.05em; background: transparent; cursor: pointer; }
  .btn-outline:hover { background: #f9fafb; }
  
  .card { border: 1px solid #f3f4f6; border-radius: 2px; padding: 24px; transition: all 0.2s; }
  .card:hover { border-color: #d1d5db; }

  .custom-checkbox { width: 24px; height: 24px; border: 2px solid #000; border-radius: 2px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; flex-shrink: 0; }
  .custom-checkbox.checked { background: #000; }
  .custom-checkbox.checked::after { content: '✓'; color: #fff; font-size: 14px; font-weight: bold; }

  .modal-overlay { position: fixed; inset: 0; background: rgba(255,255,255,0.95); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); }
  .modal-content { background: white; border: 1px solid #000; width: 100%; max-width: 450px; padding: 32px; position: relative; }
  
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .animate-spin { animation: spin 1s linear infinite; }
  /* Оновлені стилі для документів */
  .doc-card-blue { 
    border: 1px solid #f3f4f6; 
    padding: 32px 24px; 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    text-align: center;
    transition: all 0.2s;
  }
  .doc-card-blue:hover { border-color: #3b82f6; }
  
  .icon-container-blue {
    padding: 12px;
    background: #eff6ff;
    color: #3b82f6;
    border: 1px solid #dbeafe;
    border-radius: 4px;
    margin-bottom: 16px;
  }

  .filter-tab {
    padding: 6px 16px;
    border: 1px solid #e5e7eb;
    font-size: 10px;
    font-weight: 700;
    cursor: pointer;
    background: white;
  }
  .filter-tab.active {
    background: black;
    color: white;
    border-color: black;
  }

  .version-item {
    border: 1px solid #f3f4f6;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
  }
  .version-info h4 { font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }
  .version-meta { font-size: 10px; color: #9ca3af; font-weight: 600; }
  .version-desc { font-size: 10px; color: #6b7280; font-style: italic; margin-top: 4px; line-height: 1.4; }
  .badge-stable { 
    font-size: 9px; 
    font-weight: 800; 
    color: #9ca3af; 
    border: 1px solid #f3f4f6; 
    padding: 1px 4px; 
    display: inline-block; 
    margin-top: 8px;
  }
`;

const INITIAL_PROJECTS = [
  {
    id: 1,
    name: "ЖК 'Sunny Tower'",
    loc: "Kyiv",
    status: "Active",
    icon: "🏗️",
  },
  { id: 2, name: "Warehouse A", loc: "Lviv", status: "Approved", icon: "🏭" },
  {
    id: 3,
    name: "ЖК 'Cloud Tower'",
    loc: "Kyiv",
    status: "Denied",
    icon: "🏗️",
  },
  { id: 4, name: "Warehouse B", loc: "Lviv", status: "Pending", icon: "⌛" },
  { id: 5, name: "ЖК 'Rainy Tower'", loc: "Kyiv", status: "Done", icon: "✅" },
];

const INITIAL_TASKS = [
  {
    id: 1,
    text: "Pour concrete foundation",
    status: "In Progress",
    done: false,
    desc: "Заливка фундаменту основного корпусу А1. Потрібно перевірити якість суміші.",
    deadline: "2026-03-10",
  },
  {
    id: 2,
    text: "Site preparation",
    status: "Done",
    done: true,
    desc: "Очищення території та встановлення паркану.",
    deadline: "2026-02-28",
  },
  {
    id: 3,
    text: "Wall construction",
    status: "To Do",
    done: false,
    desc: "Початок цегляної кладки другого поверху.",
    deadline: "2026-04-15",
  },
];

const INITIAL_DOCS = [
  {
    id: 1,
    name: "Project Plans",
    uploader: "John Smith",
    date: "2025-10-15",
    version: "v2.1 Final",
    stable: true,
  },
  {
    id: 2,
    name: "Site Reports",
    uploader: "Jane Smith",
    date: "2025-10-10",
    version: "v1.5 Draft",
    stable: false,
  },
  {
    id: 3,
    name: "Inspection Certificates",
    uploader: "Mike Wayne",
    date: "2025-09-30",
    version: "v1.0 Stable",
    stable: true,
  },
  {
    id: 4,
    name: "Contracts",
    uploader: "Sarah Lyon",
    date: "2025-08-25",
    version: "v1.3 Draft",
    stable: false,
  },
];

const INITIAL_INCIDENTS = [
  {
    id: 1,
    name: "Broken equipment on site B",
    date: "Feb 20",
    severity: "Critical",
    desc: "Зламаний баштовий кран. Потребує термінового ремонту або заміни деталей.",
  },
  {
    id: 2,
    name: "Weather delay alert",
    date: "Feb 19",
    severity: "Medium",
    desc: "Сильний вітер перешкоджає проведенню висотних робіт.",
  },
];

/* ── App Shell ───────────────────────────────────────────────────────────── */
function AppShell({ page, setPage, children }) {
  const navigation = [
    { name: "Dashboard", key: "dashboard", icon: LayoutDashboard },
    { name: "Projects", key: "projects", icon: Layers },
    { name: "Analytics", key: "analytics", icon: BarChart3 },
    { name: "Settings", key: "settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-white text-slate-900 overflow-hidden">
      <aside className="w-[200px] flex-shrink-0 border-r border-gray-100 bg-gray-50 flex flex-col">
        <div className="p-4 flex items-center gap-2 border-b border-gray-100 bg-white">
          <Layers size={18} />
          <h1 className="text-[11px] font-bold uppercase tracking-tight">
            Construction Dashboard
          </h1>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navigation.map((item) => (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-[11px] font-bold rounded transition-colors text-left border-none cursor-pointer ${
                page === item.key ||
                (item.key === "projects" && page === "project_details")
                  ? "bg-gray-200 text-black shadow-sm"
                  : "text-gray-400 hover:text-black bg-transparent"
              }`}
            >
              <item.icon size={14} />
              {item.name}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-12 border-b border-gray-100 bg-white flex items-center justify-between px-8 flex-shrink-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {page.replace("_", " ")}
          </div>
          <div className="flex items-center gap-6">
            <nav className="flex gap-4 text-[10px] font-bold uppercase text-gray-400">
              <button
                onClick={() => setPage("dashboard")}
                className="hover:text-black bg-transparent border-none cursor-pointer font-bold uppercase"
              >
                Home
              </button>
              <button
                onClick={() => setPage("tasks")}
                className="hover:text-black bg-transparent border-none cursor-pointer font-bold uppercase"
              >
                Tasks
              </button>
              <button
                onClick={() => setPage("documents")}
                className="hover:text-black bg-transparent border-none cursor-pointer font-bold uppercase"
              >
                Documents
              </button>
              <button
                onClick={() => setPage("incidents")}
                className="hover:text-black bg-transparent border-none cursor-pointer font-bold uppercase"
              >
                Incidents
              </button>
            </nav>
            <div className="relative">
              <input
                type="text"
                placeholder="Search in site"
                className="pr-8 pl-3 py-1 bg-white border border-gray-200 rounded text-[10px] w-48 focus:outline-none focus:border-black"
              />
              <Search
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300"
                size={10}
              />
            </div>
            <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

/* ── Dashboard Page ──────────────────────────────────────────────────────── */
function DashboardPage({ onProjectClick, setPage }) {
  const createFormRef = useRef(null);
  const scrollToCreate = () =>
    createFormRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="max-w-5xl mx-auto p-12 space-y-24 pb-32">
      <section className="text-center space-y-8 flex flex-col items-center">
        <h1 className="text-4xl font-bold">Construction Projects</h1>
        <button onClick={scrollToCreate} className="btn-black px-12">
          + New Project
        </button>
      </section>

      <section className="grid grid-cols-12 gap-8 items-start">
        <div className="col-span-5">
          <h2 className="text-3xl font-bold uppercase tracking-tight">
            Project Registry
          </h2>
        </div>
        <div className="col-span-7 divide-y divide-gray-50">
          {INITIAL_PROJECTS.map((p) => (
            <div
              key={p.id}
              onClick={() => onProjectClick(p)}
              className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-6">
                <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-xl rounded grayscale group-hover:grayscale-0 transition-all">
                  {p.icon}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase">{p.name}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-tight">
                    {p.loc}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
                {p.status}
                {p.status === "Active" && (
                  <Settings size={14} className="text-gray-400" />
                )}
                {p.status === "Approved" && (
                  <CheckCircle2 size={14} className="text-gray-400" />
                )}
                {p.status === "Denied" && (
                  <XCircle size={14} className="text-gray-400" />
                )}
                {p.status === "Pending" && (
                  <Clock size={14} className="text-gray-400" />
                )}
                {p.status === "Done" && (
                  <CheckCircle2 size={14} className="text-gray-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="text-center space-y-12">
        <h2 className="text-2xl font-bold uppercase tracking-tight">
          Quick Access
        </h2>
        <div className="grid grid-cols-3 gap-8">
          {[
            {
              key: "tasks",
              icon: CheckSquare,
              title: "Tasks",
              desc: "Manage tasks for this project",
            },
            {
              key: "documents",
              icon: FileText,
              title: "Docs",
              desc: "Access project documentation",
            },
            {
              key: "incidents",
              icon: AlertTriangle,
              title: "Incidents",
              desc: "Report or view incidents",
            },
          ].map((c) => (
            <div
              key={c.key}
              onClick={() => setPage(c.key)}
              className="card flex flex-col items-center text-center gap-5 cursor-pointer"
            >
              <div className="p-5 border border-black rounded-lg">
                <c.icon size={36} strokeWidth={1} />
              </div>
              <div className="space-y-1 flex flex-col items-center">
                <h3 className="text-xs font-bold uppercase">{c.title}</h3>
                <p className="text-[10px] text-gray-400 max-w-[140px] leading-tight">
                  {c.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="text-center space-y-12">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold uppercase">Overview</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Key metrics on project status.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Total Projects", val: "3", change: null },
            { label: "Completed", val: "1", change: "+1" },
            { label: "In Progress", val: "1", change: "0" },
            { label: "Pending", val: "1", change: "0" },
          ].map((s) => (
            <div
              key={s.label}
              className="p-8 border border-gray-100 text-left rounded-sm"
            >
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-2 tracking-widest">
                {s.label}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{s.val}</span>
                {s.change && (
                  <span className="text-[10px] text-gray-400 font-bold">
                    {s.change}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        ref={createFormRef}
        className="text-center space-y-12 pt-12 border-t border-gray-50"
      >
        <h2 className="text-2xl font-bold uppercase">Create New Project</h2>
        <div className="grid grid-cols-3 gap-6 text-left">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-400">
              Project Name
            </label>
            <input className="input-field" placeholder="Enter project name" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-400">
              Site Address
            </label>
            <input className="input-field" placeholder="Enter site address" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-400">
              Initial Budget
            </label>
            <input className="input-field" placeholder="Enter budget amount" />
          </div>
        </div>
        <div className="flex justify-center gap-4">
          <button className="btn-outline px-16">Cancel</button>
          <button className="btn-black px-16">Create</button>
        </div>
      </section>

      <footer className="text-center pt-20 flex justify-center gap-10 text-[10px] font-bold uppercase text-gray-400">
        <span>© 2026 TechBuild</span>
        <a href="#" className="hover:text-black">
          Privacy Policy
        </a>
        <a href="#" className="hover:text-black">
          Terms of Service
        </a>
      </footer>
    </div>
  );
}

/* ── Tasks Components ────────────────────────────────────────────────────── */
function TasksPage({ onTaskClick }) {
  const { tasks, toggleTask, addTask } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ text: "", status: "To Do" });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.text.trim()) return;
    addTask(form.text, form.status);
    setForm({ text: "", status: "To Do" });
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-12 py-16">
      <header className="text-center space-y-4 mb-20">
        <h1 className="text-3xl font-bold">Today's Tasks</h1>
        <p className="text-[10px] text-gray-400 font-bold uppercase">
          Keep track of all your engineering tasks.
        </p>
        <div className="flex justify-center gap-3 pt-4">
          <button className="btn-outline">Filter Tasks</button>
          <button onClick={() => setIsModalOpen(true)} className="btn-black">
            Add New Task
          </button>
        </div>
      </header>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black bg-transparent border-none cursor-pointer"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-6 uppercase">New Task</h2>
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-500">
                  Task Title
                </label>
                <input
                  className="input-field"
                  autoFocus
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  placeholder="Enter task..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-500">
                  Status
                </label>
                <select
                  className="input-field"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-outline px-6"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-black px-6">
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto space-y-12">
        <h2 className="text-2xl font-bold text-center uppercase tracking-tight">
          Task List
        </h2>
        <div className="space-y-6">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between py-2 border-b border-gray-50 pb-4"
            >
              <div className="flex items-center gap-6">
                <div
                  className={`custom-checkbox ${t.done ? "checked" : ""}`}
                  onClick={() => toggleTask(t.id)}
                />
                <span
                  onClick={() => onTaskClick(t)}
                  className={`text-sm font-semibold cursor-pointer hover:underline ${t.done ? "text-gray-300 line-through" : "text-black"}`}
                >
                  {t.text}
                </span>
              </div>
              <span className="text-[9px] font-bold uppercase text-gray-400 bg-gray-50 px-2 py-1">
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TaskDetailsPage({ task, onBack }) {
  const { updateTaskDetails } = useContext(AppContext);
  const [form, setForm] = useState({ ...task });

  const handleSave = () => {
    updateTaskDetails(form);
    onBack();
  };

  return (
    <div className="max-w-2xl mx-auto p-12 py-16">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[10px] font-bold uppercase mb-12 text-gray-400 hover:text-black transition-colors"
      >
        <ChevronLeft size={14} /> Back to tasks
      </button>

      <div className="space-y-10">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-gray-400">
            Task Title
          </label>
          <input
            className="text-3xl font-bold bg-transparent border-none w-full focus:outline-none"
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-2">
              <Calendar size={12} /> Deadline
            </label>
            <input
              type="date"
              className="input-field"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-2">
              <Info size={12} /> Status
            </label>
            <select
              className="input-field"
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value,
                  done: e.target.value === "Done",
                })
              }
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-gray-400">
            Description
          </label>
          <textarea
            className="input-field h-32 resize-none"
            value={form.desc}
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
          />
        </div>

        <button onClick={handleSave} className="btn-black w-full py-4">
          <Save size={16} /> Save Changes
        </button>
      </div>
    </div>
  );
}

/* ── Documents Page ──────────────────────────────────────────────────────── */
function DocumentsPage() {
  const { docs, addDoc } = useContext(AppContext);
  const [filter, setFilter] = useState("All");
  const fileInputRef = useRef(null);

  const handleDownload = (docName) => {
    // Імітація завантаження
    const element = document.createElement("a");
    const file = new Blob(["Контент документа: " + docName], {
      type: "text/plain",
    });
    element.href = URL.createObjectURL(file);
    element.download = `${docName}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-5xl mx-auto p-12 py-10 space-y-16">
      {/* Header */}
      <header className="text-center space-y-4">
        <h2 className="text-xl font-bold uppercase tracking-tight">
          Documents
        </h2>
        <p className="text-[10px] text-gray-400 font-bold uppercase">
          Your upload history and available documents.
        </p>
        <div className="pt-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-black px-12 mx-auto"
          >
            Upload Files
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              if (e.target.files[0])
                addDoc({
                  id: Date.now(),
                  name: e.target.files[0].name,
                  uploader: "Admin",
                  date: "2026-03-03",
                  version: "v1.0 Draft",
                  stable: false,
                });
            }}
          />
        </div>
      </header>

      {/* Grid */}
      <section className="grid grid-cols-4 gap-6">
        {docs.map((doc) => (
          <div key={doc.id} className="doc-card-blue">
            <div className="icon-container-blue">
              <FileText size={40} strokeWidth={1} />
            </div>
            <div className="space-y-1">
              <div
                className="text-[11px] font-bold uppercase truncate w-32"
                title={doc.name}
              >
                {doc.name}
              </div>
              <div className="text-[9px] text-gray-400 font-bold uppercase">
                Uploaded by {doc.uploader}
              </div>
              <div className="text-[10px] font-bold mt-2">{doc.date}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Filter Section */}
      <section className="space-y-8 pt-12 border-t border-gray-100 text-center">
        <h2 className="text-xl font-bold uppercase tracking-tight">
          Filter Documents
        </h2>
        <div className="flex justify-center -space-x-px">
          <button
            onClick={() => setFilter("All")}
            className={`filter-tab ${filter === "All" ? "active" : ""}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("Stable")}
            className={`filter-tab ${filter === "Stable" ? "active" : ""}`}
          >
            Certified Stable Versions
          </button>
        </div>
        <button className="btn-black px-12 mx-auto">Apply Filter</button>
      </section>

      {/* Versions Section */}
      <section className="space-y-8 pt-12 border-t border-gray-100">
        <h2 className="text-xl font-bold text-center uppercase tracking-tight">
          Document Versions
        </h2>
        <div className="flex justify-center">
          <button
            onClick={() => alert("Завантаження всіх архівних копій...")}
            className="btn-black px-12"
          >
            Download All
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto mt-10">
          {docs.map((v) => (
            <div key={v.id} className="version-item">
              <div className="flex gap-4">
                <div className="text-blue-300 pt-1">
                  <FileText size={24} />
                </div>
                <div className="version-info">
                  <h4>{v.name}</h4>
                  <p className="version-meta">{v.version || "v2.1 — Final"}</p>
                  <p className="version-desc">
                    Latest version available for download.
                  </p>
                  <span className="badge-stable">
                    {v.stable ? "STABLE" : "DRAFT"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDownload(v.name)}
                className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-sm hover:opacity-80 transition-opacity"
              >
                <Download size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ── Incidents Components ─────────────────────────────────────────────────── */
function IncidentsPage({ onIncidentClick }) {
  const { incidents, addIncident } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", desc: "", severity: "Medium" });

  const handleReport = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addIncident(form.name, form.desc, form.severity);
    setForm({ name: "", desc: "", severity: "Medium" });
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-12 py-16 space-y-24">
      <header className="text-center space-y-6 flex flex-col items-center">
        <h1 className="text-4xl font-bold uppercase tracking-tight">
          Incidents Tab
        </h1>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          Overview of reported incidents related to this project.
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-black px-12"
        >
          + Report Incident
        </button>
      </header>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black bg-transparent border-none cursor-pointer"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-6 uppercase tracking-tight">
              Report Incident
            </h2>
            <form onSubmit={handleReport} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-500">
                  Incident Name
                </label>
                <input
                  className="input-field"
                  autoFocus
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="What happened?"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-500">
                  Short Description
                </label>
                <textarea
                  className="input-field h-24 resize-none"
                  value={form.desc}
                  onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  placeholder="Provide some details..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-500">
                  Severity
                </label>
                <select
                  className="input-field"
                  value={form.severity}
                  onChange={(e) =>
                    setForm({ ...form, severity: e.target.value })
                  }
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-outline px-6"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-black px-6">
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="grid grid-cols-12 gap-8 items-start">
        <div className="col-span-5">
          <h2 className="text-3xl font-bold uppercase tracking-tight">
            Reported Incidents
          </h2>
        </div>
        <div className="col-span-7 divide-y divide-gray-100">
          {incidents.map((i) => (
            <div key={i.id} className="flex items-center justify-between py-6">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 flex items-center justify-center border border-gray-100 rounded">
                  <AlertTriangle size={24} className="text-gray-400" />
                </div>
                <span
                  onClick={() => onIncidentClick(i)}
                  className="text-sm font-bold uppercase cursor-pointer hover:underline"
                >
                  {i.name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-900">
                  {i.date} — {i.severity}
                </div>
              </div>
            </div>
          ))}
          {incidents.length === 0 && (
            <div className="py-20 text-center text-gray-200 uppercase text-[10px] font-bold tracking-[0.2em]">
              Інцидентів не зафіксовано
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function IncidentDetailsPage({ incident, onBack }) {
  const { updateIncidentDetails } = useContext(AppContext);
  const [form, setForm] = useState({ ...incident });

  const handleSave = () => {
    updateIncidentDetails(form);
    onBack();
  };

  return (
    <div className="max-w-2xl mx-auto p-12 py-16">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[10px] font-bold uppercase mb-12 text-gray-400 hover:text-black transition-colors"
      >
        <ChevronLeft size={14} /> Back to incidents
      </button>

      <div className="space-y-10">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-gray-400">
            Incident Name
          </label>
          <input
            className="text-3xl font-bold bg-transparent border-none w-full focus:outline-none uppercase tracking-tight"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-2">
              <Calendar size={12} /> Creation Date
            </label>
            <input
              type="text"
              className="input-field"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-2">
              <AlertCircle size={12} /> Severity
            </label>
            <select
              className="input-field"
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-gray-400">
            Description
          </label>
          <textarea
            className="input-field h-32 resize-none"
            value={form.desc}
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
          />
        </div>

        <button
          onClick={handleSave}
          className="btn-black w-full py-4 uppercase font-bold tracking-widest"
        >
          <Save size={16} /> Save Changes
        </button>
      </div>
    </div>
  );
}

/* ── Main App Component ──────────────────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);

  const toggleTask = (id) => {
    setTasks((ts) =>
      ts.map((t) => {
        if (t.id === id) {
          if (!t.done) return { ...t, done: true, status: "Done" };
          return { ...t, done: false, status: "To Do" };
        }
        return t;
      }),
    );
  };

  const addTask = (text, status) => {
    setTasks((prev) => [
      ...prev,
      {
        id: Date.now(),
        text,
        status,
        done: status === "Done",
        desc: "",
        deadline: "2026-12-31",
      },
    ]);
  };

  const updateTaskDetails = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
    );
  };

  const addDoc = (doc) => {
    setDocs((prev) => [doc, ...prev]);
  };

  const addIncident = (name, desc, severity) => {
    const today = new Date();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const dateStr = `${months[today.getMonth()]} ${today.getDate()}`;

    setIncidents((prev) => [
      { id: Date.now(), name, desc, severity, date: dateStr },
      ...prev,
    ]);
  };

  const updateIncidentDetails = (updatedIncident) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === updatedIncident.id ? updatedIncident : i)),
    );
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        toggleTask,
        addTask,
        updateTaskDetails,
        docs,
        addDoc,
        incidents,
        addIncident,
        updateIncidentDetails,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <AppShell page={page} setPage={setPage}>
        {page === "dashboard" && (
          <DashboardPage
            onProjectClick={(p) => {
              setSelectedProject(p);
              setPage("project_details");
            }}
            setPage={setPage}
          />
        )}

        {page === "projects" && (
          <div className="max-w-4xl mx-auto p-16 space-y-12">
            <h1 className="text-4xl font-bold text-center uppercase tracking-tight">
              Project Registry
            </h1>
            <div className="divide-y divide-gray-100 border-t border-gray-100">
              {INITIAL_PROJECTS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedProject(p);
                    setPage("project_details");
                  }}
                  className="flex items-center justify-between py-6 px-4 hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-6">
                    <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">
                      {p.icon}
                    </span>
                    <span className="text-sm font-bold uppercase">
                      {p.name}
                    </span>
                  </div>
                  <ChevronRight size={18} className="text-gray-300" />
                </div>
              ))}
            </div>
          </div>
        )}

        {page === "project_details" && selectedProject && (
          <div className="space-y-0">
            <div className="bg-gray-50 p-16 text-center border-b border-gray-100">
              <button
                onClick={() => setPage("projects")}
                className="text-[10px] font-bold uppercase mb-4 text-gray-400 hover:text-black"
              >
                ← Back to Registry
              </button>
              <div className="text-5xl mb-4">{selectedProject.icon}</div>
              <h1 className="text-3xl font-bold uppercase tracking-tight">
                {selectedProject.name}
              </h1>
              <p className="text-[10px] font-bold uppercase text-gray-400 mt-2 tracking-[0.2em]">
                {selectedProject.loc} — {selectedProject.status}
              </p>
            </div>
            <TasksPage
              onTaskClick={(t) => {
                setSelectedTask(t);
                setPage("task_details");
              }}
            />
          </div>
        )}

        {page === "tasks" && (
          <TasksPage
            onTaskClick={(t) => {
              setSelectedTask(t);
              setPage("task_details");
            }}
          />
        )}

        {page === "task_details" && selectedTask && (
          <TaskDetailsPage
            task={selectedTask}
            onBack={() =>
              setPage(selectedProject ? "project_details" : "tasks")
            }
          />
        )}

        {page === "documents" && <DocumentsPage />}

        {page === "incidents" && (
          <IncidentsPage
            onIncidentClick={(i) => {
              setSelectedIncident(i);
              setPage("incident_details");
            }}
          />
        )}

        {page === "incident_details" && selectedIncident && (
          <IncidentDetailsPage
            incident={selectedIncident}
            onBack={() => setPage("incidents")}
          />
        )}

        {["analytics", "settings"].includes(page) && (
          <div className="flex flex-col items-center justify-center h-[70vh] text-gray-100">
            {page === "analytics" ? (
              <BarChart3 size={120} strokeWidth={1} />
            ) : (
              <Settings size={120} strokeWidth={1} />
            )}
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] mt-6 text-gray-300">
              Section {page}
            </p>
          </div>
        )}
      </AppShell>
    </AppContext.Provider>
  );
}
