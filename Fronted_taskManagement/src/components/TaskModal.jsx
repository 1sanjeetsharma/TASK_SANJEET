import { useState, useEffect } from "react";
import { tasksAPI } from "../api";

const EMPTY = { title: "", description: "", status: "pending", priority: "medium", due_date: "" };

export default function TaskModal({ task, onClose, onSaved }) {
  const isEdit = !!task;
  const [form, setForm]     = useState(isEdit ? { ...task, due_date: task.due_date || "" } : EMPTY);
  const [error, setError]   = useState("");
  const [saving, setSaving] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Task title is required."); return; }

    setSaving(true);
    try {
      if (isEdit) {
        await tasksAPI.update(task.id, form);
      } else {
        await tasksAPI.create(form);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative card w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900">
            {isEdit ? "Edit task" : "New task"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="What needs to be done?"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Add details (optional)…"
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input-field">
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange} className="input-field">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Due date</label>
            <input
              type="date"
              name="due_date"
              value={form.due_date}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving…
                </span>
              ) : isEdit ? "Save changes" : "Create task"}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
