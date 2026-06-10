const express = require("express");
const db = require("../db/database");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// All task routes require authentication
router.use(authMiddleware);

// ─── GET /api/tasks ────────────────────────────────────────────────────────
// Get all tasks for the logged-in user (with optional filters)
router.get("/", (req, res) => {
  const { status, priority, search } = req.query;
  const userId = req.user.id;

  let query = "SELECT * FROM tasks WHERE user_id = ?";
  const params = [userId];

  if (status) {
    query += " AND status = ?";
    params.push(status);
  }
  if (priority) {
    query += " AND priority = ?";
    params.push(priority);
  }
  if (search) {
    query += " AND (title LIKE ? OR description LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  query += " ORDER BY created_at DESC";

  const tasks = db.prepare(query).all(...params);
  res.json({ tasks, count: tasks.length });
});

// ─── POST /api/tasks ───────────────────────────────────────────────────────
// Create a new task
router.post("/", (req, res) => {
  const { title, description, status, priority, due_date } = req.body;
  const userId = req.user.id;

  if (!title || title.trim().length === 0) {
    return res.status(400).json({ error: "Task title is required." });
  }

  const validStatuses = ["pending", "in-progress", "completed"];
  const validPriorities = ["low", "medium", "high"];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(", ")}` });
  }
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({ error: `Priority must be one of: ${validPriorities.join(", ")}` });
  }

  const stmt = db.prepare(`
    INSERT INTO tasks (user_id, title, description, status, priority, due_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    userId,
    title.trim(),
    description?.trim() || "",
    status || "pending",
    priority || "medium",
    due_date || null
  );

  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ message: "Task created successfully.", task });
});

// ─── GET /api/tasks/:id ────────────────────────────────────────────────────
// Get a single task
router.get("/:id", (req, res) => {
  const task = db
    .prepare("SELECT * FROM tasks WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);

  if (!task) return res.status(404).json({ error: "Task not found." });
  res.json({ task });
});

// ─── PUT /api/tasks/:id ────────────────────────────────────────────────────
// Update a task
router.put("/:id", (req, res) => {
  const { title, description, status, priority, due_date } = req.body;
  const userId = req.user.id;
  const taskId = req.params.id;

  const existing = db.prepare("SELECT * FROM tasks WHERE id = ? AND user_id = ?").get(taskId, userId);
  if (!existing) return res.status(404).json({ error: "Task not found." });

  const validStatuses = ["pending", "in-progress", "completed"];
  const validPriorities = ["low", "medium", "high"];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(", ")}` });
  }
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({ error: `Priority must be one of: ${validPriorities.join(", ")}` });
  }

  const stmt = db.prepare(`
    UPDATE tasks
    SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `);

  stmt.run(
    title?.trim() ?? existing.title,
    description?.trim() ?? existing.description,
    status ?? existing.status,
    priority ?? existing.priority,
    due_date !== undefined ? due_date : existing.due_date,
    taskId,
    userId
  );

  const updated = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId);
  res.json({ message: "Task updated successfully.", task: updated });
});

// ─── DELETE /api/tasks/:id ─────────────────────────────────────────────────
// Delete a task
router.delete("/:id", (req, res) => {
  const existing = db
    .prepare("SELECT id FROM tasks WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);

  if (!existing) return res.status(404).json({ error: "Task not found." });

  db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
  res.json({ message: "Task deleted successfully." });
});

// ─── GET /api/tasks/stats/summary ─────────────────────────────────────────
// Get task summary stats
router.get("/stats/summary", (req, res) => {
  const userId = req.user.id;

  const total = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE user_id = ?").get(userId).count;
  const pending = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = 'pending'").get(userId).count;
  const inProgress = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = 'in-progress'").get(userId).count;
  const completed = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = 'completed'").get(userId).count;

  res.json({ stats: { total, pending, inProgress, completed } });
});

module.exports = router;
