import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH =
  process.env.DB_PATH ||
  path.join(__dirname, "..", "..", "..", "data", "agent-economy.db");

// Ensure data directory exists
import { mkdirSync } from "fs";
mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db: InstanceType<typeof Database> = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    bounty_usdt REAL NOT NULL,
    required_capabilities TEXT DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'open',
    creator_address TEXT,
    agent_address TEXT,
    result TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    accepted_at TEXT,
    submitted_at TEXT,
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    task_id TEXT,
    type TEXT NOT NULL,
    from_address TEXT,
    to_address TEXT,
    amount_usdt REAL NOT NULL,
    tool_id TEXT,
    tx_hash TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (task_id) REFERENCES tasks(id)
  );

  CREATE TABLE IF NOT EXISTS agent_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_address TEXT NOT NULL,
    action TEXT NOT NULL,
    detail TEXT,
    task_id TEXT,
    amount_usdt REAL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Indexes for frequent query patterns (idempotent)
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_tasks_status_created ON tasks(status, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_activity_created ON agent_activity(created_at DESC);
`);

console.log("Database initialized at", DB_PATH);
