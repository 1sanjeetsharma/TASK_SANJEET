const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/database");

const router = express.Router();

// ─── POST /api/auth/register ───────────────────────────────────────────────
router.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  // Check if email exists
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return res.status(409).json({ error: "Email already registered." });
  }

  // Hash password
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Insert user
  const stmt = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
  const result = stmt.run(name, email.toLowerCase().trim(), hashedPassword);

  // Generate JWT
  const token = jwt.sign(
    { id: result.lastInsertRowid, email: email.toLowerCase().trim(), name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.status(201).json({
    message: "User registered successfully.",
    token,
    user: { id: result.lastInsertRowid, name, email: email.toLowerCase().trim() },
  });
});

// ─── POST /api/auth/login ──────────────────────────────────────────────────
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase().trim());

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.json({
    message: "Login successful.",
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

// ─── GET /api/auth/me ──────────────────────────────────────────────────────
const authMiddleware = require("../middleware/auth");
router.get("/me", authMiddleware, (req, res) => {
  const user = db
    .prepare("SELECT id, name, email, created_at FROM users WHERE id = ?")
    .get(req.user.id);

  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({ user });
});

module.exports = router;
