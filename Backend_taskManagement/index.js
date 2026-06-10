require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "TaskApp API is running 🚀",
    version: "1.0.0",
    endpoints: {
      auth: {
        "POST /api/auth/register": "Register a new user",
        "POST /api/auth/login": "Login",
        "GET /api/auth/me": "Get current user (auth required)",
      },
      tasks: {
        "GET /api/tasks": "Get all tasks (auth required)",
        "POST /api/tasks": "Create task (auth required)",
        "GET /api/tasks/:id": "Get task by ID (auth required)",
        "PUT /api/tasks/:id": "Update task (auth required)",
        "DELETE /api/tasks/:id": "Delete task (auth required)",
        "GET /api/tasks/stats/summary": "Get task stats (auth required)",
      },
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ─── Error Handler ────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error." });
});

// ─── Start Server ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 TaskApp API running at http://localhost:${PORT}`);
  console.log(`📄 API docs at http://localhost:${PORT}/\n`);
});
