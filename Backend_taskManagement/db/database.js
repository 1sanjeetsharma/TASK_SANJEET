const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "../../database.sqlite");

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in-progress', 'completed')),
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
    due_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

console.log("✅ Database initialized at", DB_PATH);

module.exports = db;
