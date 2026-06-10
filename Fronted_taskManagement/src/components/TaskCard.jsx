import { tasksAPI } from "../api";

const STATUS_STYLES = {
  "pending":     "bg-yellow-50 text-yellow-700 border-yellow-200",
  "in-progress": "bg-blue-50 text-blue-700 border-blue-200",
  "completed":   "bg-green-50 text-green-700 border-green-200",
};

const STATUS_LABELS = {
  "pending":     "Pending",
  "in-progress": "In Progress",
  "completed":   "Completed",
};

const PRIORITY_STYLES = {
  low:    "text-slate-500",
  medium: "text-amber-600",
  high:   "text-red-600",
};

const PRIORITY_DOTS = {
  low:    "bg-slate-400",
  medium: "bg-amber-500",
  high:   "bg-red-500",
};

export default function TaskCard({ task, onEdit, onDeleted }) {
  const handleDelete = async () => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await tasksAPI.delete(task.id);
      onDeleted(task.id);
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed.");
    }
  };

  const isOverdue = task.due_date && task.status !== "completed"
    && new Date(task.due_date) < new Date();

  return (
    <div className="card p-4 hover:shadow-md transition-shadow duration-150 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-semibold text-slate-900 truncate ${task.status === "completed" ? "line-through text-slate-400" : ""}`}>
              {task.title}
            </h3>
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[task.status]}`}>
              {STATUS_LABELS[task.status]}
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{task.description}</p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-4 mt-2">
            <span className={`flex items-center gap-1.5 text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOTS[task.priority]}`} />
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} priority
            </span>

            {task.due_date && (
              <span className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-500 font-medium" : "text-slate-400"}`}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {isOverdue ? "Overdue · " : ""}
                {new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title="Edit task"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete task"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
