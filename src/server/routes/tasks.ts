import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../db/index.js";
import { logAttestation } from "../services/attestation.js";

export const taskRoutes = Router();

// Create a new bounty task
taskRoutes.post("/", (req, res) => {
  const {
    title,
    description,
    bounty_usdt,
    required_capabilities,
    creator_address,
  } = req.body;

  if (!title || !description || !bounty_usdt) {
    res.status(400).json({
      error: "Missing required fields: title, description, bounty_usdt",
    });
    return;
  }

  const id = uuid();
  db.prepare(
    `
    INSERT INTO tasks (id, title, description, bounty_usdt, required_capabilities, creator_address, status)
    VALUES (?, ?, ?, ?, ?, ?, 'open')
  `
  ).run(
    id,
    title,
    description,
    bounty_usdt,
    JSON.stringify(required_capabilities || []),
    creator_address || null
  );

  logActivity(
    null,
    "task_created",
    `New task: ${title} ($${bounty_usdt})`,
    id,
    bounty_usdt
  );

  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  res.status(201).json(task);
});

// List tasks (filterable by status)
taskRoutes.get("/", (req, res) => {
  const status = req.query.status as string;
  let tasks;
  if (status) {
    tasks = db
      .prepare("SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC")
      .all(status);
  } else {
    tasks = db.prepare("SELECT * FROM tasks ORDER BY created_at DESC").all();
  }
  res.json({ tasks, count: tasks.length });
});

// Get a specific task
taskRoutes.get("/:id", (req, res) => {
  const task = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(req.params.id);
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.json(task);
});

// Agent accepts a task
taskRoutes.post("/:id/accept", (req, res) => {
  const { agent_address } = req.body;
  if (!agent_address) {
    res.status(400).json({ error: "Missing agent_address" });
    return;
  }

  const task = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(req.params.id) as any;
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  if (task.status !== "open") {
    res.status(409).json({ error: `Task is ${task.status}, not open` });
    return;
  }

  db.prepare(
    `
    UPDATE tasks SET status = 'in_progress', agent_address = ?, accepted_at = datetime('now')
    WHERE id = ?
  `
  ).run(agent_address, req.params.id);

  logActivity(
    agent_address,
    "task_accepted",
    `Accepted: ${task.title}`,
    req.params.id
  );

  const updated = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(req.params.id);
  res.json(updated);
});

// Agent submits result
taskRoutes.post("/:id/submit", (req, res) => {
  const { agent_address, result } = req.body;
  if (!result) {
    res.status(400).json({ error: "Missing result" });
    return;
  }

  const task = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(req.params.id) as any;
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  if (task.status !== "in_progress") {
    res.status(400).json({ error: `Task is ${task.status}, not in_progress` });
    return;
  }
  if (task.agent_address !== agent_address) {
    res.status(403).json({ error: "Only the assigned agent can submit" });
    return;
  }

  db.prepare(
    `
    UPDATE tasks SET status = 'submitted', result = ?, submitted_at = datetime('now')
    WHERE id = ?
  `
  ).run(result, req.params.id);

  logActivity(
    agent_address,
    "task_submitted",
    `Submitted result for: ${task.title}`,
    req.params.id
  );

  const updated = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(req.params.id);
  res.json(updated);
});

// Human approves result -> triggers payment to agent
taskRoutes.post("/:id/approve", (req, res) => {
  const task = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(req.params.id) as any;
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  if (task.status !== "submitted") {
    res.status(400).json({ error: `Task is ${task.status}, not submitted` });
    return;
  }

  db.prepare(
    `
    UPDATE tasks SET status = 'completed', completed_at = datetime('now')
    WHERE id = ?
  `
  ).run(req.params.id);

  // Record payment transaction
  const txId = uuid();
  db.prepare(
    `
    INSERT INTO transactions (id, task_id, type, from_address, to_address, amount_usdt, status)
    VALUES (?, ?, 'task_payment', ?, ?, ?, 'completed')
  `
  ).run(
    txId,
    req.params.id,
    task.creator_address,
    task.agent_address,
    task.bounty_usdt
  );

  logActivity(
    task.agent_address,
    "payment_received",
    `Earned $${task.bounty_usdt} for: ${task.title}`,
    req.params.id,
    task.bounty_usdt
  );

  // Log on-chain attestation and store tx_hash
  logAttestation(
    req.params.id,
    task.agent_address,
    task.bounty_usdt,
    "task_completed"
  ).then((txHash) => {
    if (txHash) {
      db.prepare("UPDATE transactions SET tx_hash = ? WHERE id = ?").run(
        txHash,
        txId
      );
    }
  });

  const updated = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(req.params.id);
  res.json({
    task: updated,
    payment: { id: txId, amount_usdt: task.bounty_usdt },
  });
});

// Human rejects result -> task goes back to open
taskRoutes.post("/:id/reject", (req, res) => {
  const task = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(req.params.id) as any;
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  if (task.status !== "submitted") {
    res.status(400).json({ error: `Task is ${task.status}, not submitted` });
    return;
  }

  db.prepare(
    `
    UPDATE tasks SET status = 'open', agent_address = NULL, result = NULL,
    accepted_at = NULL, submitted_at = NULL
    WHERE id = ?
  `
  ).run(req.params.id);

  logActivity(
    task.agent_address,
    "task_rejected",
    `Result rejected for: ${task.title}`,
    req.params.id
  );

  const updated = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(req.params.id);
  res.json(updated);
});

// Get transactions (for dashboard)
taskRoutes.get("/api/transactions", (_req, res) => {
  const transactions = db
    .prepare("SELECT * FROM transactions ORDER BY created_at DESC LIMIT 50")
    .all();
  res.json({ transactions });
});

// Get agent activity feed
taskRoutes.get("/api/activity", (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const activities = db
    .prepare("SELECT * FROM agent_activity ORDER BY created_at DESC LIMIT ?")
    .all(limit);
  res.json({ activities });
});

// Get economy metrics
taskRoutes.get("/api/metrics", (_req, res) => {
  const totalTasks = (
    db.prepare("SELECT COUNT(*) as count FROM tasks").get() as any
  ).count;
  const completedTasks = (
    db
      .prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'")
      .get() as any
  ).count;
  const totalVolume = (
    db
      .prepare(
        "SELECT COALESCE(SUM(amount_usdt), 0) as total FROM transactions"
      )
      .get() as any
  ).total;
  const agentEarnings = (
    db
      .prepare(
        "SELECT COALESCE(SUM(amount_usdt), 0) as total FROM transactions WHERE type = 'task_payment'"
      )
      .get() as any
  ).total;
  const agentSpending = (
    db
      .prepare(
        "SELECT COALESCE(SUM(amount_usdt), 0) as total FROM transactions WHERE type = 'tool_purchase'"
      )
      .get() as any
  ).total;

  res.json({
    totalTasks,
    completedTasks,
    openTasks: (
      db
        .prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'open'")
        .get() as any
    ).count,
    totalVolume,
    agentEarnings,
    agentSpending,
    agentProfit: agentEarnings - agentSpending,
  });
});

function logActivity(
  agentAddress: string | null,
  action: string,
  detail: string,
  taskId?: string,
  amount?: number
) {
  db.prepare(
    `
    INSERT INTO agent_activity (agent_address, action, detail, task_id, amount_usdt)
    VALUES (?, ?, ?, ?, ?)
  `
  ).run(
    agentAddress || "system",
    action,
    detail,
    taskId || null,
    amount || null
  );
}

// Record tool purchase transactions (called by agent when it buys a tool)
taskRoutes.post("/api/transactions/tool-purchase", (req, res) => {
  const { task_id, agent_address, tool_id, amount_usdt, tx_hash } = req.body;

  const txId = uuid();
  db.prepare(
    `
    INSERT INTO transactions (id, task_id, type, from_address, to_address, amount_usdt, tool_id, tx_hash, status)
    VALUES (?, ?, 'tool_purchase', ?, 'platform', ?, ?, ?, 'completed')
  `
  ).run(
    txId,
    task_id || null,
    agent_address,
    amount_usdt,
    tool_id,
    tx_hash || null
  );

  logActivity(
    agent_address,
    "tool_purchased",
    `Bought ${tool_id} for $${amount_usdt}`,
    task_id,
    amount_usdt
  );

  // Log on-chain attestation and store tx_hash
  logAttestation(
    task_id || "unknown",
    agent_address,
    amount_usdt,
    "tool_purchased"
  ).then((txHash) => {
    if (txHash) {
      db.prepare("UPDATE transactions SET tx_hash = ? WHERE id = ?").run(
        txHash,
        txId
      );
    }
  });

  res.status(201).json({ id: txId });
});
