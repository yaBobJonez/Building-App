import React, {
  useState,
  useRef,
  createContext,
  useContext,
  useEffect,
} from "react";
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
  UploadCloud,
} from "lucide-react";

const API_BASE_URL = "http://localhost:8000";

// --- Fallback Data ---
const MOCK_PROJECTS = [
  {
    project_id: "1",
    name: "ЖК 'Sunny Tower'",
    address: "Kyiv",
    status: "Active",
    icon: "🏗️",
  },
  {
    project_id: "2",
    name: "Warehouse A",
    address: "Lviv",
    status: "Approved",
    icon: "🏭",
  },
];

const MOCK_TASKS = [
  {
    task_id: "101",
    title: "Pour concrete foundation",
    status: "In Progress",
    deadline: "2026-03-10",
  },
  {
    task_id: "102",
    title: "Site preparation",
    status: "Done",
    deadline: "2026-02-28",
  },
];

const MOCK_DOCS = [
  {
    document_id: "1",
    title: "Project Plans",
    uploader: "John Smith",
    created_at: "2025-10-15",
    version: "v2.1 Final",
    stable: true,
  },
  {
    document_id: "2",
    title: "Site Reports",
    uploader: "Jane Smith",
    created_at: "2025-10-10",
    version: "v1.5 Draft",
    stable: false,
  },
  {
    document_id: "3",
    title: "Inspection Certificates",
    uploader: "Mike Wayne",
    created_at: "2025-09-30",
    version: "v1.0 Stable",
    stable: true,
  },
  {
    document_id: "4",
    title: "Contracts",
    uploader: "Sarah Lyon",
    created_at: "2025-08-25",
    version: "v1.3 Draft",
    stable: false,
  },
];

const MOCK_INCIDENTS = [
  {
    incident_id: "1",
    title: "Broken equipment on site B",
    date: "Feb 20",
    priority: "Critical",
    description: "Зламаний кран.",
  },
  {
    incident_id: "2",
    title: "Weather delay alert",
    date: "Feb 19",
    priority: "Medium",
    description: "Сильний вітер.",
  },
];

const AppContext = createContext();

const cssStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;800&display=swap');
  :root { --font:'Public Sans', sans-serif; }
  body { font-family:var(--font); background-color: #ffffff; color: #1a1a1a; margin: 0; }
  .input-field { border: 1px solid #e5e7eb; padding: 10px 12px; border-radius: 2px; font-size: 12px; width: 100%; background: white; }
  .btn-black { background: #000; color: #fff; font-size: 10px; font-weight: 700; padding: 10px 20px; border-radius: 2px; text-transform: uppercase; cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .btn-outline { border: 1px solid #e5e7eb; color: #000; font-size: 10px; font-weight: 700; padding: 10px 20px; border-radius: 2px; text-transform: uppercase; background: transparent; cursor: pointer; }
  .custom-checkbox { width: 24px; height: 24px; border: 2px solid #000; border-radius: 2px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
  .custom-checkbox.checked { background: #000; }
  .custom-checkbox.checked::after { content: '✓'; color: #fff; font-size: 14px; font-weight: bold; }
  .filter-tab { padding: 6px 16px; border: 1px solid #e5e7eb; font-size: 10px; font-weight: 700; cursor: pointer; background: white; }
  .filter-tab.active { background: black; color: white; border-color: black; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(255,255,255,0.95); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); }
  .modal-content { background: white; border: 1px solid #000; width: 100%; max-width: 450px; padding: 32px; position: relative; }
  .doc-card-blue { border: 1px solid #f3f4f6; padding: 32px 24px; display: flex; flex-direction: column; align-items: center; text-align: center; }
  .icon-container-blue { padding: 12px; background: #eff6ff; color: #3b82f6; border-radius: 4px; margin-bottom: 16px; }
  .card { 
  border: 1px solid #f3f4f6; 
  border-radius: 2px; 
  padding: 24px; 
  transition: all 0.2s; 
}
.card:hover { 
  border-color: #000; 
  background-color: #f9fafb; /* опціонально для кращого візуального відгуку */
}
`;

/* ── Components ── */

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold uppercase tracking-tight">
            {title}
          </h2>
          <button onClick={onClose} className="text-gray-400">
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AppShell({ page, setPage, children, isLoading }) {
  const navigation = [
    { name: "Dashboard", key: "dashboard", icon: LayoutDashboard },
    { name: "Projects", key: "projects", icon: Layers },
    { name: "Analytics", key: "analytics", icon: BarChart3 },
    { name: "Settings", key: "settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-white text-slate-900 overflow-hidden">
      <aside className="w-[200px] border-r border-gray-100 bg-gray-50 flex flex-col">
        <div className="p-4 flex items-center gap-2 border-b bg-white">
          <Layers size={18} />
          <h1 className="text-[11px] font-bold uppercase">ARCHON System</h1>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navigation.map((item) => (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-[11px] font-bold rounded text-left border-none cursor-pointer ${page === item.key || (item.key === "projects" && page === "project_details") ? "bg-gray-200 text-black shadow-sm" : "text-gray-400 hover:text-black bg-transparent"}`}
            >
              <item.icon size={14} />
              {item.name}
            </button>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-12 border-b bg-white flex items-center justify-between px-8 flex-shrink-0">
          <div className="text-[10px] font-bold uppercase text-gray-400">
            {page.replace("_", " ")}
          </div>
          <div className="flex items-center gap-6">
            <nav className="flex gap-4 text-[10px] font-bold uppercase text-gray-400">
              {["dashboard", "tasks", "documents", "incidents"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="hover:text-black bg-transparent border-none cursor-pointer uppercase font-bold"
                >
                  {p}
                </button>
              ))}
            </nav>
            <div className="w-7 h-7 rounded-full bg-gray-200" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
              <Loader2 className="animate-spin" size={32} />
              <p className="text-[10px] font-bold uppercase">Loading...</p>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

/* ── Dashboard Page ── */
function DashboardPage({ onProjectClick, setPage }) {
  const { projects, createProject } = useContext(AppContext);
  const [newProject, setNewProject] = useState({
    name: "",
    address: "",
    budget: "",
  });
  const createFormRef = useRef(null);

  // Локальний стан для форми
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    budget: "",
  });

  const handleCreate = () => {
    if (!formData.name || !formData.address)
      return alert("Fill required fields");
    createProject(formData);
    setFormData({ name: "", address: "", budget: "" }); // Очищення форми
  };

  return (
    <div className="max-w-5xl mx-auto p-12 space-y-24 pb-32">
      <section className="text-center space-y-8 flex flex-col items-center">
        <h1 className="text-4xl font-bold uppercase tracking-tight">
          Construction Projects
        </h1>
        <button
          onClick={() =>
            createFormRef.current?.scrollIntoView({ behavior: "smooth" })
          }
          className="btn-black px-12"
        >
          + New Project
        </button>
      </section>
      <section className="grid grid-cols-12 gap-8 items-start">
        <div className="col-span-5 pt-4">
          <h2 className="text-3xl font-bold uppercase tracking-tight">
            Project Registry
          </h2>
        </div>
        <div className="col-span-7 divide-y divide-gray-50">
          {projects.map((p) => (
            <div
              key={p.project_id}
              onClick={() => onProjectClick(p)}
              className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 cursor-pointer group"
            >
              <div className="flex items-center gap-6">
                <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-xl rounded grayscale group-hover:grayscale-0">
                  {p.icon || "🏗️"}
                </div>
                <div>
                  <div className="text-sm font-bold uppercase">{p.name}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-tight">
                    {p.address}
                  </div>
                </div>
              </div>
              <div className="text-[10px] font-bold uppercase text-gray-400">
                {p.status}
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Секція Quick Access (image_c96e62) */}
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
              className="card flex flex-col items-center text-center gap-5 cursor-pointer hover:border-black transition-all"
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

      {/* Секція Overview (image_c96e62) */}
      <section className="text-center space-y-12">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold uppercase">Overview</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Key metrics on project status.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Total Projects", val: projects.length, change: null },
            {
              label: "Completed",
              // Фільтруємо за статусом COMPLETED (великими літерами, як у базі)
              val: projects.filter((p) => p.status === "COMPLETED").length,
              change: null,
            },
            {
              label: "In Progress",
              // Фільтруємо за статусом ACTIVE
              val: projects.filter((p) => p.status === "ACTIVE").length,
              change: null,
            },
            {
              label: "Pending",
              // Фільтруємо за статусом PENDING
              val: projects.filter((p) => p.status === "PENDING").length,
              change: null,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="p-8 border border-gray-100 text-left rounded-sm bg-white"
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
        className="pt-12 border-t border-gray-50 text-center"
      >
        <h2 className="text-2xl font-bold uppercase mb-10">
          Initialize Project
        </h2>
        <div className="grid grid-cols-3 gap-6 text-left">
          <input
            className="input-field"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            className="input-field"
            placeholder="Address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />
          <input
            className="input-field"
            placeholder="Budget"
            value={formData.budget}
            onChange={(e) =>
              setFormData({ ...formData, budget: e.target.value })
            }
          />
        </div>
        <div className="flex justify-center gap-4 mt-8">
          <button
            className="btn-outline px-16"
            onClick={() => setFormData({ name: "", address: "", budget: "" })}
          >
            Cancel
          </button>
          <button className="btn-black px-16" onClick={handleCreate}>
            Create
          </button>
        </div>
      </section>
    </div>
  );
}

/* ── Tasks Page ── */
function TasksPage({ filterProjectId }) {
  const { tasks, toggleTask, createTask, updateTaskDetails } =
    useContext(AppContext);
  const [modalMode, setModalMode] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  // Нові стани для розширеної фільтрації
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Фільтруємо спочатку за ID проєкту (якщо він переданий), потім за статусом
  const displayedTasks = tasks.filter((t) => {
    const matchesProject = filterProjectId
      ? t.project_id === filterProjectId
      : true;
    const matchesStatus =
      statusFilter === "ALL" ? true : t.status === statusFilter;
    return matchesProject && matchesStatus;
  });

  const handleSave = async (e) => {
    if (e) {
      e.preventDefault(); // Запобігаємо перезавантаженню сторінки
      e.stopPropagation(); // Зупиняємо спливання події
    }
    if (!activeTask?.title) return alert("Title is required");
    if (modalMode === "add") {
      // Викликаємо функцію створення задачі
      await createTask(activeTask);
    } else if (modalMode === "edit") {
      // Викликаємо функцію оновлення
      await updateTaskDetails(activeTask);
    }
    // Закриваємо модалку ТІЛЬКИ після успішного виклику
    setModalMode(null);
    setActiveTask(null);
  };

  const taskStatuses = ["ALL", "TODO", "IN_PROGRESS", "DONE"];

  return (
    <div className="max-w-4xl mx-auto p-12 py-16">
      <header className="text-center space-y-4 mb-20">
        <h1 className="text-3xl font-bold uppercase tracking-tight">
          {filterProjectId ? "Project Tasks" : "All Tasks Registry"}
        </h1>
        <div className="flex justify-center gap-3 relative">
          {/* Кнопка фільтрації з випадаючим списком */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`btn-outline ${statusFilter !== "ALL" ? "bg-gray-100 border-black" : ""}`}
            >
              Filter: {statusFilter}
            </button>

            {showFilterMenu && (
              <div className="absolute top-full mt-2 w-40 bg-white border border-black z-50 shadow-xl">
                {taskStatuses.map((status) => (
                  <button
                    key={status}
                    className="w-full px-4 py-2 text-[10px] font-bold uppercase text-left hover:bg-gray-50 border-b last:border-0"
                    onClick={() => {
                      setStatusFilter(status);
                      setShowFilterMenu(false);
                    }}
                  >
                    {status.replace("_", " ")}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Кнопка відображається ТІЛЬКИ якщо є filterProjectId */}
          {filterProjectId && (
            <button
              onClick={() => {
                setActiveTask({
                  title: "",
                  status: "TODO",
                  description: "",
                  deadline: "",
                });
                setModalMode("add");
              }}
              className="btn-black"
            >
              + Add New Task
            </button>
          )}
        </div>
      </header>

      <div className="max-w-xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-center uppercase mb-10">
          Task List
        </h2>
        {displayedTasks.map((t) => (
          <div
            key={t.task_id}
            className="flex items-center justify-between py-4 border-b border-gray-50"
          >
            <div className="flex items-center gap-6">
              {/* ВИПРАВЛЕНО: Чекбокс тепер перевіряє статус DONE */}
              <div
                className={`custom-checkbox ${t.status === "DONE" ? "checked" : ""}`}
                onClick={() => toggleTask(t.task_id)}
              />
              <span
                onClick={() => {
                  setActiveTask(t);
                  setModalMode("edit");
                }}
                className={`text-sm font-semibold cursor-pointer hover:underline ${t.status === "DONE" ? "text-gray-300 line-through" : ""}`}
              >
                {t.title}
              </span>
            </div>
            <span className="text-[9px] font-bold uppercase text-gray-400 bg-gray-50 px-2 py-1">
              {t.status.replace("_", " ")}
            </span>
          </div>
        ))}
      </div>
      {/* ... (Modal для Tasks) ... */}
      <Modal
        isOpen={!!modalMode}
        onClose={() => setModalMode(null)}
        title={modalMode === "add" ? "New Task" : "Edit Task"}
      >
        <form onSubmit={handleSave} className="space-y-6 text-left">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-400">
              Title
            </label>
            <input
              className="input-field"
              value={activeTask?.title || ""}
              onChange={(e) =>
                setActiveTask({ ...activeTask, title: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400">
                Deadline
              </label>
              <input
                type="date"
                className="input-field"
                value={activeTask?.deadline || ""}
                onChange={(e) =>
                  setActiveTask({ ...activeTask, deadline: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400">
                Status
              </label>
              <select
                className="input-field"
                value={activeTask?.status || "TODO"}
                onChange={(e) =>
                  setActiveTask({ ...activeTask, status: e.target.value })
                }
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-400">
              Description
            </label>
            <textarea
              className="input-field h-32 resize-none"
              value={activeTask?.description || ""}
              onChange={(e) =>
                setActiveTask({ ...activeTask, description: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            className="btn-black w-full py-4 uppercase font-bold tracking-widest"
          >
            {modalMode === "add" ? "Create Task" : "Save Changes"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

/* ── Documents Page ── */
function DocumentsPage({ filterProjectId }) {
  const {
    docs,
    uploadDocument,
    createNewVersion,
    updateVersionStatus,
    downloadVersion,
    deleteVersion,
    selectedProject,
    users,
  } = useContext(AppContext);

  const fileInputRef = useRef(null);
  const versionInputRef = useRef(null);
  const [targetDocId, setTargetDocId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");

  // Фільтрація документів за проєктом та статусом
  const displayedDocs = docs.filter((doc) => {
    const matchesProject = filterProjectId
      ? doc.project_id === filterProjectId
      : true;

    if (activeFilter === "All") return matchesProject;

    // Перевіряємо статус ВЕРСІЙ документа (великими літерами)
    const targetStatus = activeFilter.toUpperCase();
    return (
      matchesProject && doc.versions?.some((v) => v.status === targetStatus)
    );
  });

  // Обробник завантаження нового документа (перша версія)
  const handleMainUpload = (e) => {
    const file = e.target.files[0];
    // Використовуємо filterProjectId (зі сторінки проєкту) або selectedProject (з контексту)
    const activeProjectId = filterProjectId || selectedProject?.project_id;

    if (file && activeProjectId) {
      uploadDocument(file.name, file, activeProjectId);
    } else {
      alert("Please select a project first on the Dashboard.");
    }
  };

  // Обробник завантаження нової версії до існуючого документа
  const handleVersionUpload = (e) => {
    const file = e.target.files[0];
    // Перевіряємо, чи є файл і чи обрано конкретний документ
    if (file && targetDocId) {
      createNewVersion(targetDocId, file);
      e.target.value = ""; // Скидаємо інпут для повторного використання
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-12 space-y-16">
      {/* Шапка та завантаження нового документа */}
      <section className="text-center space-y-6">
        <header className="space-y-2">
          <h2 className="text-3xl font-bold uppercase tracking-tight">
            Project Documents
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
            Managing versions and statuses
          </p>
        </header>

        <button
          onClick={() => fileInputRef.current.click()}
          className="btn-black px-12 mx-auto"
        >
          Upload New Document
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleMainUpload}
        />
        <input
          type="file"
          ref={versionInputRef}
          className="hidden"
          onChange={handleVersionUpload}
        />
      </section>

      {/* Фільтрація документів (FR-12) */}
      <div className="flex justify-center gap-4">
        {["All", "Stable", "Draft"].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 border-b-2 transition-all ${
              activeFilter === filter
                ? "border-black text-black"
                : "border-transparent text-gray-300 hover:text-gray-500"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Список документів та їхніх версій (FR-12) */}
      <div className="space-y-8">
        {displayedDocs
          .filter((doc) => {
            if (activeFilter === "All") return true;
            // Перевірка, чи має хоча б одна версія документа потрібний статус
            return doc.versions?.some(
              (v) => v.status === activeFilter.toUpperCase(),
            );
          })
          .map((doc) => (
            <div
              key={doc.document_id}
              className="border border-gray-100 bg-white shadow-sm overflow-hidden"
            >
              {/* Заголовок документа */}
              <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-tight">
                    {doc.title}
                  </h3>
                  <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">
                    {/* Знаходимо автора за ID у масиві користувачів */}
                    Author:{" "}
                    {users.find((u) => u.user_id === doc.created_by)
                      ?.full_name || "Unknown"}{" "}
                    • Versions: {doc.versions?.length || 0}
                  </p>
                </div>
                {/* Кнопка додавання версії */}
                <button
                  onClick={() => {
                    setTargetDocId(doc.document_id);
                    versionInputRef.current.click();
                  }}
                  className="text-[9px] font-bold uppercase border border-black px-4 py-2 hover:bg-black hover:text-white transition-all"
                >
                  + Add New Version
                </button>
              </div>

              {/* Список версій (FR-10, FR-11) */}
              <div className="divide-y divide-gray-50">
                {doc.versions && doc.versions.length > 0 ? (
                  doc.versions
                    .sort((a, b) => b.version_number - a.version_number) // Нові версії зверху
                    .map((v) => (
                      <div
                        key={v.version_id}
                        className="p-4 flex justify-between items-center hover:bg-gray-50/30 transition-colors"
                      >
                        <div className="flex items-center gap-6">
                          <div className="flex flex-col items-center justify-center w-12 h-12 border border-gray-100 bg-white rounded-sm shadow-sm">
                            <span className="text-[10px] font-black italic">
                              v{v.version_number}
                            </span>
                            <FileText size={14} className="text-gray-300" />
                          </div>

                          <div className="space-y-1">
                            <div className="text-[10px] font-bold text-gray-900 uppercase">
                              Date: {new Date(v.uploaded_at).toLocaleString()}
                            </div>
                            {/* Керування статусом (FR-11) */}
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                                Status:
                              </span>
                              <select
                                className={`text-[9px] font-extrabold uppercase bg-transparent outline-none cursor-pointer ${
                                  v.status === "STABLE"
                                    ? "text-green-600"
                                    : v.status === "ARCHIVED"
                                      ? "text-gray-400"
                                      : "text-blue-500"
                                }`}
                                value={v.status}
                                onChange={(e) =>
                                  updateVersionStatus(
                                    v.version_id,
                                    e.target.value,
                                  )
                                }
                              >
                                <option value="DRAFT">Draft</option>
                                <option value="STABLE">Stable</option>
                                <option value="ARCHIVED">Archived</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Завантаження версії (FR-10) */}
                        {/* Блок кнопок управління (тепер вони разом праворуч) */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => downloadVersion(v.version_id)}
                            className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-full hover:scale-105 active:scale-95 transition-all shadow-md"
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                          {/* Видалення версії */}
                          <button
                            onClick={() => deleteVersion(v.version_id)}
                            className="w-10 h-10 border border-red-100 text-red-500 flex items-center justify-center rounded-full hover:bg-red-50 hover:border-red-200 active:scale-95 transition-all shadow-sm"
                            title="Delete version"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="p-8 text-center text-[10px] font-bold text-gray-300 uppercase italic">
                    No versions available for this document
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

/* ── Page: Incidents ── */
function IncidentsPage({ filterProjectId }) {
  const {
    incidents,
    createIncident,
    updateIncident,
    resolveIncident,
    selectedProject,
  } = useContext(AppContext);
  const [activeInc, setActiveInc] = useState(null);
  const [modalMode, setModalMode] = useState(null);

  // Стани для FR-14 (Пошук та Фільтрація)
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const handleSave = async () => {
    if (!activeInc.title) return alert("Title is required");

    if (modalMode === "add") {
      const dataToSave = filterProjectId
        ? { ...activeInc, project_id: filterProjectId }
        : activeInc;
      await createIncident(dataToSave);
    } else if (modalMode === "edit") {
      // Використовуємо incident_id для PATCH запиту до бекенду
      await updateIncident(activeInc.incident_id, {
        title: activeInc.title,
        description: activeInc.description,
        priority: activeInc.priority,
      });
    }
    setModalMode(null);
    setActiveInc(null);
  };

  // Логіка фільтрації
  const filteredIncidents = incidents.filter((i) => {
    const matchesProject = filterProjectId
      ? i.project_id === filterProjectId
      : true;
    const matchesSearch = i.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesPriority =
      priorityFilter === "ALL" || i.priority === priorityFilter;
    return matchesProject && matchesSearch && matchesPriority;
  });

  return (
    <div className="max-w-5xl mx-auto p-12 py-16 space-y-16">
      <header className="text-center space-y-6 flex flex-col items-center">
        <h1 className="text-4xl font-bold uppercase tracking-tight">
          Incidents Registry
        </h1>

        {/* Панель пошуку та фільтрації (FR-14) */}
        <div className="flex gap-4 w-full justify-center">
          {/* ВИПРАВЛЕНО: збільшено pl-12, щоб текст не наїжджав на іконку */}
          <div className="relative w-64">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              className="input-field"
              style={{ paddingLeft: "36px" }}
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="input-field w-40"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <button
            onClick={() => {
              setActiveInc({ title: "", priority: "Medium", description: "" });
              setModalMode("add");
            }}
            className="btn-black whitespace-nowrap"
          >
            + Report
          </button>
        </div>
      </header>

      <section className="grid grid-cols-12 gap-12 items-start">
        <div className="col-span-12 divide-y divide-gray-100 border-t">
          {filteredIncidents.length > 0 ? (
            filteredIncidents.map((i) => (
              <div
                key={i.incident_id}
                className="flex items-center justify-between py-6 hover:bg-gray-50 px-4 transition-all group"
              >
                <div className="flex items-center gap-6">
                  <div
                    className={`p-2 border rounded ${i.priority === "Critical" ? "border-red-100 text-red-500" : "border-gray-100 text-gray-300"}`}
                  >
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    {/* ВИПРАВЛЕНО:setActiveInc({ ...i }) гарантує передачу всіх полів, включаючи пріоритет */}
                    <span
                      onClick={() => {
                        setActiveInc({ ...i });
                        setModalMode("edit");
                      }}
                      className="text-sm font-bold uppercase cursor-pointer hover:underline block"
                    >
                      {i.title}
                    </span>
                    <p className="text-[10px] text-gray-400 uppercase">
                      {new Date(
                        i.created_at || Date.now(),
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest ${
                      i.priority === "Critical"
                        ? "text-red-600"
                        : i.priority === "High"
                          ? "text-orange-500"
                          : "text-gray-400"
                    }`}
                  >
                    {i.priority}
                  </span>
                  <button
                    onClick={() => resolveIncident(i.incident_id)}
                    className="opacity-0 group-hover:opacity-100 text-[9px] font-bold uppercase text-green-600 border border-green-600 px-3 py-1 rounded-sm hover:bg-green-600 hover:text-white transition-all"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-gray-300 uppercase font-bold text-xs tracking-widest">
              No incidents found matching filters
            </div>
          )}
        </div>
      </section>

      <Modal
        isOpen={!!modalMode}
        onClose={() => setModalMode(null)}
        title={modalMode === "add" ? "Report Incident" : "Incident Details"}
      >
        <div className="space-y-6 text-left">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-400">
              Title
            </label>
            <input
              className="input-field"
              value={activeInc?.title || ""}
              onChange={(e) =>
                setActiveInc({ ...activeInc, title: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-400">
              Priority
            </label>
            {/* ВИПРАВЛЕНО: value тепер чітко прив'язаний до стану */}
            <select
              className="input-field"
              // Примусово до верхнього регістру для синхронізації з Enum
              value={activeInc?.priority?.toUpperCase() || "MEDIUM"}
              onChange={(e) =>
                setActiveInc({ ...activeInc, priority: e.target.value })
              }
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-400">
              Description
            </label>
            <textarea
              className="input-field h-32 resize-none"
              value={activeInc?.description || ""}
              onChange={(e) =>
                setActiveInc({ ...activeInc, description: e.target.value })
              }
            />
          </div>
          <button
            onClick={handleSave}
            className="btn-black w-full py-4 uppercase font-bold tracking-widest"
          >
            {modalMode === "add" ? "Report Now" : "Save Changes"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

/* ── Main App ── */

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);

  // Стани для всіх сутностей з бекенду
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [docs, setDocs] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [users, setUsers] = useState([]); // Нове: список користувачів
  const [selectedProject, setSelectedProject] = useState(null);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [p, t, d_base, i, u] = await Promise.all([
        fetch(`${API_BASE_URL}/projects`).then((r) => r.json()),
        fetch(`${API_BASE_URL}/tasks`).then((r) => r.json()),
        fetch(`${API_BASE_URL}/documents`).then((r) => r.json()),
        fetch(`${API_BASE_URL}/incidents`).then((r) => r.json()),
        fetch(`${API_BASE_URL}/users`).then((r) => r.json()), // Додано користувачів
      ]);

      // 1. Отримуємо деталі з версіями ТІЛЬКИ якщо d_base — це масив
      let finalDocs = MOCK_DOCS;
      if (Array.isArray(d_base)) {
        finalDocs = await Promise.all(
          d_base.map((doc) =>
            fetch(`${API_BASE_URL}/documents/${doc.document_id}`).then((r) =>
              r.json(),
            ),
          ),
        );
      }

      // 2. Встановлюємо стан ОДИН РАЗ актуальними даними
      setDocs(finalDocs);

      const validatedProjects = Array.isArray(p) ? p : MOCK_PROJECTS;
      setProjects(validatedProjects);
      setTasks(Array.isArray(t) ? t : MOCK_TASKS);
      setIncidents(Array.isArray(i) ? i : MOCK_INCIDENTS);
      setUsers(Array.isArray(u) ? u : []);

      if (selectedProject) {
        const current = validatedProjects.find(
          (proj) => proj.project_id === selectedProject.project_id,
        );
        if (current) setSelectedProject(current);
      }
    } catch (err) {
      console.error("Backend connection failed, using MOCK data", err);
      setProjects(MOCK_PROJECTS);
      setTasks(MOCK_TASKS);
      setDocs(MOCK_DOCS);
      setIncidents(MOCK_INCIDENTS);
    } finally {
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const createProject = async (projectData) => {
    // Перевіряємо, чи завантажилися користувачі з бази
    if (users.length === 0) {
      alert("Помилка: Користувачі не завантажені. Спробуйте оновити сторінку.");
      return;
    }

    // Беремо user_id першого користувача (адміна)
    const adminId = users[0].user_id;

    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectData.name,
          address: projectData.address,
          initial_budget: parseFloat(projectData.budget), // Число з плаваючою крапкою
          created_by: adminId, // Реальний UUID
        }),
      });

      if (response.ok) {
        console.log("Проєкт створено!");
        await loadAllData(); // Тепер ця функція точно визначена
      }
    } catch (err) {
      console.error("Error creating project:", err);
    }
  };

  const handleCreateProject = async (projectData) => {
    // Перевіряємо, чи завантажилися користувачі
    if (users.length === 0) {
      console.error("Користувачів не знайдено. Створення проекту неможливе.");
      return;
    }

    // Автоматично беремо ID першого користувача з масиву
    const adminId = users[0].user_id;

    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectData.name,
          address: projectData.address,
          initial_budget: parseFloat(projectData.budget),
          created_by: adminId, // тут реальний UUID з бази
        }),
      });

      if (response.ok) {
        await loadAllData(); // Оновлюємо список проектів на екрані (FR-02: Оновлення реєстру)
      }
    } catch (err) {
      console.error("Помилка створення проекту:", err);
    }
  };

  // FR-03: Зміна статусу проєкту
  const updateProjectStatus = async (projectId, newStatus) => {
    if (!users[0]) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: newStatus,
            changed_by: users[0].user_id, // Фіксуємо, хто змінив статус
          }),
        },
      );

      if (response.ok) {
        console.log(`Статус проєкту змінено на ${newStatus}`);
        await loadAllData(); // Оновлюємо інтерфейс
      }
    } catch (err) {
      console.error("Error updating project status:", err);
    }
  };

  // Додатково: Видалення проєкту (якщо бекенд підтримує DELETE /projects/{id})
  const deleteProject = async (projectId) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цей проєкт?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setPage("dashboard");
        await loadAllData();
      }
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  // FR-05: Створення нової задачі
  const createTask = async (taskData) => {
    // selectedProject має бути встановлений при переході на сторінку проєкту
    if (!selectedProject || !users[0]) return;

    // Перевіряємо дату: якщо порожня або undefined — ставимо null
    const cleanDeadline =
      taskData.deadline && taskData.deadline.trim() !== ""
        ? taskData.deadline
        : null;

    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskData.title,
          project_id: selectedProject.project_id, // UUID обраного проєкту
          created_by: users[0].user_id, // UUID адміністратора з бази
          description: taskData.description || "",
          // Якщо дедлайн не вказано, передаємо null (бекенд це дозволяє) (дата має бути YYYY-MM-DD)
          deadline: cleanDeadline, // Тепер тут або дата, або null
          status: taskData.status || "TODO",
        }),
      });
      if (response.ok) {
        await loadAllData(); // Оновлюємо список задач (FR-05)
      } else {
        const errorData = await response.json();
        console.error("Backend validation error:", errorData.detail);
        alert("Error: " + JSON.stringify(errorData.detail));
      }
    } catch (err) {
      console.error("Network error during task creation:", err);
    }
  };

  // Оновлення існуючої задачі (назва, опис, дедлайн)
  const updateTaskDetails = async (taskData) => {
    try {
      // 1. Оновлюємо текстові поля (PATCH)
      await fetch(`${API_BASE_URL}/tasks/${taskData.task_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskData.title,
          description: taskData.description,
          deadline: taskData.deadline,
        }),
      });

      // 2. Оновлюємо статус окремим запитом (PUT), як того вимагає бекенд
      if (users[0]) {
        await fetch(`${API_BASE_URL}/tasks/${taskData.task_id}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: taskData.status, // Статус із випадаючого списку
            changed_by: users[0].user_id,
          }),
        });
      }

      await loadAllData(); // Оновлюємо все на екрані
    } catch (err) {
      console.error("Error updating task details:", err);
    }
  };
  // -------- Документи ----------------
  const createNewVersion = async (documentId, file) => {
    if (!users[0]) return;

    // Query-параметри (те, що йде в посиланні)
    const params = new URLSearchParams({
      uploaded_by: users[0].user_id,
      status: "DRAFT",
    });

    // Body-дані (тільки файл)
    const formData = new FormData();
    formData.append("file", file); // Ключ "file" має збігатися зі Swagger

    try {
      const response = await fetch(
        `${API_BASE_URL}/documents/${documentId}/versions?${params.toString()}`,
        {
          method: "POST",
          body: formData, // Файл іде в тілі (multipart/form-data)
        },
      );
      if (response.ok) {
        await loadAllData();
      } else {
        const errorData = await response.json();
        console.error("Backend error details:", errorData.detail);
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  };

  const uploadDocument = async (title, file, projectId) => {
    if (!users[0]) return;

    // передається в посиланні
    const params = new URLSearchParams({
      title: title,
      project_id: projectId,
      created_by: users[0].user_id,
      status: "DRAFT",
    });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `${API_BASE_URL}/documents?${params.toString()}`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (response.ok) {
        await loadAllData();
      }
    } catch (err) {
      console.error("Network error during upload:", err);
    }
  };

  // FR-11: Оновлення статусу версії
  const updateVersionStatus = async (versionId, newStatus) => {
    try {
      // ВАЖЛИВО: бекенд очікує ключ 'data' у query-параметрах
      const response = await fetch(
        `${API_BASE_URL}/documents/versions/${versionId}/status?data=${newStatus}`,
        {
          method: "PUT",
          // Тіло запиту залишається порожнім
        },
      );

      if (response.ok) {
        await loadAllData();
      } else {
        const errorData = await response.json();
        // Тут можна побачити точну причину, якщо 422 залишиться
        console.error("Backend validation error:", errorData.detail);
      }
    } catch (err) {
      console.error("Error updating version status:", err);
    }
  };
  // Завантаження версії
  const downloadVersion = async (versionId) => {
    // Відкриваємо пряме посилання на завантаження з бекенду/MinIO
    window.open(
      `${API_BASE_URL}/documents/versions/${versionId}/download`,
      "_blank",
    );
  };

  //Видалення версії
  const deleteVersion = async (versionId) => {
    if (
      !window.confirm(
        "Ви впевнені, що хочете видалити цю версію? Файл також буде видалено з сервера.",
      )
    )
      return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/documents/versions/${versionId}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        console.log("Версію видалено");
        await loadAllData();
      } else {
        const errorData = await response.json();
        console.error("Помилка видалення:", errorData.detail);
      }
    } catch (err) {
      console.error("Network error during version deletion:", err);
    }
  };

  // -------------- Задачі (чекбокси)
  // Виправлена логіка чекбоксів (працює з DONE великими літерами)
  const toggleTask = async (id) => {
    if (users.length === 0) return;
    const adminId = users[0].user_id;

    // 1. Знаходимо поточну задачу, щоб визначити її наступний статус
    const taskToUpdate = tasks.find((t) => t.task_id === id);
    if (!taskToUpdate) return;

    const newStatus = taskToUpdate.status === "DONE" ? "TODO" : "DONE";

    // 2. Оптимістичне оновлення інтерфейсу (миттєво змінюємо в UI)
    setTasks((prev) =>
      prev.map((t) => (t.task_id === id ? { ...t, status: newStatus } : t)),
    );

    try {
      // 3. Реальний PUT запит до бекенду
      const response = await fetch(`${API_BASE_URL}/tasks/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          changed_by: adminId, // Передаємо реальний UUID користувача
        }),
      });

      if (response.ok) {
        await loadAllData(); // Гарантоване оновлення з бази
      }
    } catch (err) {
      console.error("Помилка при оновленні статусу:", err);
    }
  };

  // FR-13: Створення інциденту в базі
  const createIncident = async (data) => {
    if (!selectedProject || !users[0]) {
      alert("Будь ласка, спочатку виберіть проєкт на дашборді!");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/incidents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description || "",
          // Перетворюємо в UPPERCASE для відповідності Enum у базі
          priority: (data.priority || "MEDIUM").toUpperCase(),
          project_id: selectedProject.project_id,
          created_by: users[0].user_id,
        }),
      });

      if (response.ok) {
        await loadAllData();
      } else {
        const err = await response.json();
        console.error("Бекенд відхилив створення:", err.detail);
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  };

  // FR-15: Оновлення інциденту
  const updateIncident = async (id, data) => {
    try {
      // Крок A: Оновлюємо основну інформацію (Title, Description)
      const response = await fetch(`${API_BASE_URL}/incidents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          // УВАГА: Якщо бекенд не підтримує оновлення пріоритету в IncidentUpdate,
          // це поле буде ігноруватися або викликати помилку
        }),
      });
      // Крок B: Оновлюємо пріоритет через спеціальний PUT маршрут бекенду
      const resPriority = await fetch(
        `${API_BASE_URL}/incidents/${id}/priority?priority=${data.priority.toUpperCase()}`,
        {
          method: "PUT",
        },
      );
      if (response.ok) await loadAllData();
    } catch (err) {
      console.error("Error updating incident:", err);
    }
  };

  // FR-15: Видалення (вирішення) інциденту
  const resolveIncident = async (id) => {
    if (!window.confirm("Позначити цей інцидент як вирішений та видалити?"))
      return;
    try {
      const response = await fetch(`${API_BASE_URL}/incidents/${id}`, {
        method: "DELETE",
      });
      if (response.ok) await loadAllData();
    } catch (err) {
      console.error("Error resolving incident:", err);
    }
  };

  // ---------- contextValue -----------
  const contextValue = {
    projects,
    tasks,
    docs,
    incidents,
    users,
    createProject,
    updateProjectStatus,
    deleteProject,
    uploadDocument,
    createNewVersion,
    updateVersionStatus,
    downloadVersion,
    deleteVersion,
    toggleTask,
    createTask,
    updateTaskDetails,
    createIncident,
    updateIncident,
    resolveIncident,

    // Створення документа (Multipart/form-data згідно з documents.py)
    /*addDoc: async (docData, file) => {
      // Бекенд очікує проект_id та created_by (UUID)
      console.log("Uploading to backend...", docData);
      setDocs((prev) => [
        {
          document_id: Date.now().toString(),
          ...docData,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    },*/
  };

  return (
    <AppContext.Provider value={contextValue}>
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
      <AppShell page={page} setPage={setPage} isLoading={isLoading}>
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
          <div className="max-w-4xl mx-auto p-16 space-y-8">
            <h1 className="text-4xl font-bold text-center uppercase">
              Project Registry
            </h1>
            {projects.map((p) => (
              <div
                key={p.project_id}
                onClick={() => {
                  setSelectedProject(p);
                  setPage("project_details");
                }}
                className="flex justify-between py-6 border-b cursor-pointer hover:bg-gray-50 px-4 transition-colors"
              >
                <div className="flex items-center gap-6">
                  <span className="text-3xl">{p.icon || "🏗️"}</span>
                  <span className="text-sm font-bold uppercase">{p.name}</span>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </div>
            ))}
          </div>
        )}
        {page === "project_details" && selectedProject && (
          <div className="space-y-0">
            <div className="bg-gray-50 p-16 text-center border-b border-gray-100">
              <div className="flex justify-between max-w-5xl mx-auto mb-8">
                <button
                  onClick={() => setPage("projects")}
                  className="text-[10px] font-bold uppercase text-gray-400 hover:text-black"
                >
                  ← Back to Registry
                </button>
                <div className="flex gap-4">
                  <select
                    className="text-[10px] font-bold uppercase border-b border-black bg-transparent outline-none cursor-pointer"
                    value={selectedProject.status}
                    onChange={(e) =>
                      updateProjectStatus(
                        selectedProject.project_id,
                        e.target.value,
                      )
                    }
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
              <div className="text-5xl mb-4">
                {selectedProject.icon || "🏗️"}
              </div>
              <h1 className="text-3xl font-bold uppercase">
                {selectedProject.name}
              </h1>
              <p className="text-[10px] font-bold uppercase text-gray-400 mt-2 tracking-widest">
                {selectedProject.address} —{" "}
                <span className="text-black">{selectedProject.status}</span>
              </p>
            </div>

            {/* Відображаємо тільки те, що стосується цього проєкту */}
            <div className="space-y-12 pb-20">
              <TasksPage filterProjectId={selectedProject.project_id} />
              {/* НОВИЙ БЛОК: Документи проєкту */}
              <div className="border-t border-gray-100 pt-12">
                <DocumentsPage filterProjectId={selectedProject.project_id} />
              </div>
              <div className="border-t border-gray-100 pt-12">
                <IncidentsPage filterProjectId={selectedProject.project_id} />
              </div>
            </div>
          </div>
        )}
        {page === "tasks" && <TasksPage />}
        {page === "documents" && <DocumentsPage />}
        {page === "incidents" && <IncidentsPage />}
        {["analytics", "settings"].includes(page) && (
          <div className="flex flex-col items-center justify-center h-[70vh] text-gray-200">
            <BarChart3 size={80} />
            <p className="text-[10px] font-bold uppercase mt-6 tracking-[0.4em]">
              Module {page} in development
            </p>
          </div>
        )}
      </AppShell>
    </AppContext.Provider>
  );
}
