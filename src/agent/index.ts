/**
 * AgentEconomy AI Agent
 *
 * Autonomous agent that:
 * 1. Polls the task board for open tasks
 * 2. Evaluates if it can complete the task (and if it's profitable)
 * 3. Accepts the task
 * 4. Plans which tools to use (via Claude API)
 * 5. Calls paid tools via x402 micropayments
 * 6. Synthesizes results into a report
 * 7. Submits the result
 * 8. Receives payment
 */
import "dotenv/config";
import { ethers } from "ethers";
import { config } from "../shared/config.js";
import { planTask } from "./planner.js";
import { callTool } from "./tool-caller.js";
import { synthesizeResult } from "./synthesizer.js";

const SERVER_URL = `http://localhost:${config.port}`;
const AGENT_ADDRESS = config.agentPrivateKey
  ? new ethers.Wallet(config.agentPrivateKey).address
  : "0x0000000000000000000000000000000000000000";
const POLL_INTERVAL_MS = 5000;

interface Task {
  id: string;
  title: string;
  description: string;
  bounty_usdt: number;
  required_capabilities: string;
  status: string;
}

async function pollAndExecute() {
  console.log("[Agent] Polling for open tasks...");

  const res = await fetch(`${SERVER_URL}/tasks?status=open`);
  if (!res.ok) {
    console.log("[Agent] Failed to fetch tasks:", res.status);
    return;
  }

  const { tasks } = (await res.json()) as { tasks: Task[] };
  if (tasks.length === 0) {
    console.log("[Agent] No open tasks found.");
    return;
  }

  const task = tasks[0]!;
  console.log(`[Agent] Found task: "${task.title}" ($${task.bounty_usdt})`);

  // Step 1: Accept the task
  console.log("[Agent] Accepting task...");
  const acceptRes = await fetch(`${SERVER_URL}/tasks/${task.id}/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agent_address: AGENT_ADDRESS }),
  });
  if (!acceptRes.ok) {
    console.log("[Agent] Failed to accept task:", await acceptRes.text());
    return;
  }
  console.log("[Agent] Task accepted.");

  // Step 2: Discover available tools
  console.log("[Agent] Discovering tools...");
  const toolsRes = await fetch(`${SERVER_URL}/tools/discover`);
  const { tools } = (await toolsRes.json()) as {
    tools: Array<{
      id: string;
      name: string;
      description: string;
      endpoint: string;
      price: string;
      method: string;
      params: Record<string, string>;
    }>;
  };
  console.log(`[Agent] Found ${tools.length} tools.`);

  // Step 3: Plan which tools to use
  console.log("[Agent] Planning execution...");
  const plan = await planTask(task, tools);
  console.log(`[Agent] Plan: use ${plan.steps.length} tools`);
  for (const step of plan.steps) {
    console.log(`  - ${step.toolId} (${JSON.stringify(step.params)})`);
  }

  // Step 4: Execute plan - call each tool
  const toolResults: Array<{
    toolId: string;
    cost: number;
    data: unknown;
  }> = [];
  let totalSpent = 0;

  for (const step of plan.steps) {
    console.log(`[Agent] Calling tool: ${step.toolId}...`);
    const tool = tools.find((t) => t.id === step.toolId);
    if (!tool) {
      console.log(`[Agent] Tool ${step.toolId} not found, skipping.`);
      continue;
    }

    const result = await callTool(SERVER_URL, tool, step.params);
    const cost = parseFloat(tool.price.replace("$", ""));
    totalSpent += cost;
    toolResults.push({ toolId: step.toolId, cost, data: result });

    // Record tool purchase in the server
    await fetch(`${SERVER_URL}/tasks/api/transactions/tool-purchase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task_id: task.id,
        agent_address: AGENT_ADDRESS,
        tool_id: step.toolId,
        amount_usdt: cost,
      }),
    });

    console.log(`[Agent] Got result from ${step.toolId} ($${cost})`);
  }

  // Step 5: Synthesize result
  console.log("[Agent] Synthesizing result...");
  const finalResult = await synthesizeResult(task, toolResults);
  console.log("[Agent] Result synthesized.");

  // Step 6: Submit result
  console.log("[Agent] Submitting result...");
  const submitRes = await fetch(`${SERVER_URL}/tasks/${task.id}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agent_address: AGENT_ADDRESS,
      result: finalResult,
    }),
  });

  if (!submitRes.ok) {
    console.log("[Agent] Failed to submit:", await submitRes.text());
    return;
  }

  const profit = task.bounty_usdt - totalSpent;
  console.log("[Agent] Result submitted successfully!");
  console.log(
    `[Agent] Economics: Earned $${
      task.bounty_usdt
    }, Spent $${totalSpent.toFixed(2)}, Profit $${profit.toFixed(2)}`
  );
}

async function main() {
  console.log("[Agent] AgentEconomy AI Agent starting...");
  console.log(`[Agent] Address: ${AGENT_ADDRESS}`);
  console.log(`[Agent] Server: ${SERVER_URL}`);
  console.log(`[Agent] Poll interval: ${POLL_INTERVAL_MS}ms`);
  console.log("");

  // Initial poll
  await pollAndExecute();

  // Continuous polling
  setInterval(async () => {
    try {
      await pollAndExecute();
    } catch (err) {
      console.error("[Agent] Error during poll:", err);
    }
  }, POLL_INTERVAL_MS);
}

main().catch(console.error);
