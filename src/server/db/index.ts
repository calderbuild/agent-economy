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

// Auto-seed demo data if DB is empty (survives Render redeploys)
const taskCount = (
  db.prepare("SELECT COUNT(*) as n FROM tasks").get() as { n: number }
).n;

if (taskCount === 0) {
  const AGENT = "0x854d98155f25f5A294cc3522472019FD07188092";
  const { randomUUID } = await import("crypto");

  const insertTask = db.prepare(`
    INSERT INTO tasks (id, title, description, bounty_usdt, required_capabilities, status,
      creator_address, agent_address, result, created_at, accepted_at, submitted_at, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now',?), datetime('now',?), datetime('now',?), datetime('now',?))
  `);

  const insertTx = db.prepare(`
    INSERT INTO transactions (id, task_id, type, from_address, to_address, amount_usdt, tool_id, tx_hash, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', datetime('now',?))
  `);

  const insertActivity = db.prepare(`
    INSERT INTO agent_activity (agent_address, action, detail, task_id, amount_usdt, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now',?))
  `);

  const seedAll = db.transaction(() => {
    // Task 1: completed
    const t1 = randomUUID();
    insertTask.run(
      t1,
      "Analyze Tesla stock performance and market outlook",
      "Get TSLA real-time stock data, search for recent analyst reports, and create a quarterly performance chart with investment insights",
      1.0,
      '["stock-data","web-search","chart-gen"]',
      "completed",
      "0xDemoUser",
      AGENT,
      `# Tesla Stock Performance Analysis\n\n## Executive Summary\nTesla (TSLA) trades at $342.17, up 0.69%. Analyst consensus bullish, 12-month target $380.\n\n## Key Findings\n- EV market growing 22.5% CAGR\n- Tesla holds 18% global EV share\n- Q4 performance: $342 (up from $200 in Q1)\n\n## Cost Summary\n- stock-data: $0.10, web-search: $0.05, chart-gen: $0.05\n- **Total spent:** $0.20`,
      "-3 hours",
      "-3 hours",
      "-2 hours",
      "-1 hours"
    );
    for (const [tool, amt, offset] of [
      ["stock-data", 0.1, "-2 hours -50 minutes"],
      ["web-search", 0.05, "-2 hours -40 minutes"],
      ["chart-gen", 0.05, "-2 hours -30 minutes"],
    ] as const) {
      insertTx.run(
        randomUUID(),
        t1,
        "tool_purchase",
        AGENT,
        "0xPayeeAddress",
        amt,
        tool,
        null,
        offset
      );
    }
    insertTx.run(
      randomUUID(),
      t1,
      "bounty_payment",
      "0xDemoUser",
      AGENT,
      1.0,
      null,
      null,
      "-1 hours"
    );
    insertActivity.run(
      AGENT,
      "task_accepted",
      "Accepted: Analyze Tesla stock performance",
      t1,
      null,
      "-3 hours"
    );
    insertActivity.run(
      AGENT,
      "tool_called",
      "Called stock-data for TSLA ($0.10)",
      t1,
      0.1,
      "-2 hours -50 minutes"
    );
    insertActivity.run(
      AGENT,
      "tool_called",
      "Called web-search for analyst reports ($0.05)",
      t1,
      0.05,
      "-2 hours -40 minutes"
    );
    insertActivity.run(
      AGENT,
      "tool_called",
      "Called chart-gen for performance chart ($0.05)",
      t1,
      0.05,
      "-2 hours -30 minutes"
    );
    insertActivity.run(
      AGENT,
      "task_submitted",
      "Submitted result for task",
      t1,
      null,
      "-2 hours"
    );
    insertActivity.run(
      AGENT,
      "payment_received",
      "Received $1.00 bounty payment",
      t1,
      1.0,
      "-1 hours"
    );

    // Task 2: open bounty
    const t2 = randomUUID();
    insertTask.run(
      t2,
      "Research AI agent market trends 2026",
      "Search for latest AI agent industry reports, get trending news, and translate key findings to Chinese",
      0.5,
      '["web-search","news","translate"]',
      "open",
      "0xDemoUser",
      null,
      null,
      "-30 minutes",
      null,
      null,
      null
    );

    // Task 3: open bounty
    const t3 = randomUUID();
    insertTask.run(
      t3,
      "Compare top 5 cloud GPU providers pricing",
      "Search for current pricing of AWS, GCP, Azure, Lambda Labs, and CoreWeave GPU instances",
      0.75,
      '["web-search"]',
      "open",
      "0xDemoUser",
      null,
      null,
      "-15 minutes",
      null,
      null,
      null
    );

    insertActivity.run(
      AGENT,
      "agent_started",
      "Agent online — polling for tasks",
      null,
      null,
      "-4 hours"
    );
    insertActivity.run(
      AGENT,
      "task_discovered",
      "Found 3 available tasks on board",
      null,
      null,
      "-3 hours -5 minutes"
    );
  });

  seedAll();
  console.log("Demo data seeded (empty database)");
}
