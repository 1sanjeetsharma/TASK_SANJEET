import { useState, useEffect, useCallback } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { tasksAPI } from "./api";
import TaskCard from "./components/TaskCard";
import TaskModal from "./components/TaskModal";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

// ─── Dashboard ──────────────────────────────────────────────────────────────

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [search, setSearch] = useState("");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filterStatus !== "all") params.status = filterStatus;
      if (filterPriority !== "all") params.priority = filterPriority;
      if (search.trim()) params.search = search.trim();

      const [tasksRes, statsRes] = await Promise.all([
        tasksAPI.getAll(params),
        tasksAPI.stats(),
      ]);
      setTasks(tasksRes.data.tasks ?? tasksRes.data);
      setStats(statsRes.data);
    } catch {
      setError("Failed to load tasks. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPriority, search]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const openCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };
  const openEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditingTask(null);
  };
  const handleSaved = () => {
    closeModal();
    fetchTasks();
  };
  const handleDeleted = (id) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  const statCards = [
    {
      label: "Total",
      value: stats?.total ?? "—",
      color: "text-slate-700",
      bg: "bg-slate-50",
      border: "border-slate-200",
    },
    {
      label: "Pending",
      value: stats?.pending ?? "—",
      color: "text-yellow-700",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
    },
    {
      label: "In Progress",
      value: stats?.in_progress ?? "—",
      color: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      label: "Completed",
      value: stats?.completed ?? "—",
      color: "text-green-700",
      bg: "bg-green-50",
      border: "border-green-200",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">
              TaskApp
            </span>
          </div>

          {/* User + logout */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-slate-500">
              Hi,{" "}
              <span className="font-medium text-slate-700">
                {user?.name ?? "there"}
              </span>
            </span>
            <button
              onClick={handleLogout}
              className="btn-secondary text-sm py-1.5 px-3"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statCards.map(({ label, value, color, bg, border }) => (
            <div
              key={label}
              className={`rounded-xl border ${border} ${bg} px-4 py-3`}
            >
              <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks…"
              className="input-field pl-9"
            />
          </div>

          {/* Filters */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field sm:w-40"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="input-field sm:w-40"
          >
            <option value="all">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          {/* New Task */}
          <button
            onClick={openCreate}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New task
          </button>
        </div>

        {/* ── Task list ── */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-slate-500 font-medium">No tasks found</p>
            <p className="text-slate-400 text-sm mt-1">
              {filterStatus !== "all" || filterPriority !== "all" || search
                ? "Try adjusting your filters."
                : "Create your first task to get started."}
            </p>
            {filterStatus === "all" && filterPriority === "all" && !search && (
              <button
                onClick={openCreate}
                className="btn-primary mt-4 inline-flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create task
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={openEdit}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Modal ── */}
      {modalOpen && (
        <TaskModal
          task={editingTask}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

// ─── Root App with Router ────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
