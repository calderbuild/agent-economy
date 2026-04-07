/**
 * Seed demo data into the backend (local or production).
 * Usage:
 *   npx tsx src/scripts/seed-demo.ts                    # localhost:4021
 *   npx tsx src/scripts/seed-demo.ts https://agent-economy-api.onrender.com  # production
 */
const API = process.argv[2] || "http://localhost:4021";

async function post(path: string, body: unknown) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function get(path: string) {
  const res = await fetch(`${API}${path}`);
  return res.json();
}

async function main() {
  console.log(`Seeding demo data to ${API}\n`);

  // Check health
  const health = await get("/health");
  console.log("Health:", health.status);

  // Create task 1: completed flow
  console.log("\n--- Task 1: Full completion flow ---");
  const task1 = await post("/tasks", {
    title: "Analyze Tesla stock performance and market outlook",
    description:
      "Get TSLA real-time stock data, search for recent analyst reports, and create a quarterly performance chart with investment insights",
    bounty_usdt: 1.0,
    required_capabilities: ["stock-data", "web-search", "chart-gen"],
    creator_address: "0xDemoUser",
  });
  console.log("Created:", task1.title);

  // Accept
  await post(`/tasks/${task1.id}/accept`, {
    agent_address: "0x854d98155f25f5A294cc3522472019FD07188092",
  });
  console.log("Accepted");

  // Tool purchases
  for (const [tool, amount] of [
    ["stock-data", 0.1],
    ["web-search", 0.05],
    ["chart-gen", 0.05],
  ] as const) {
    await post("/tasks/api/transactions/tool-purchase", {
      task_id: task1.id,
      agent_address: "0x854d98155f25f5A294cc3522472019FD07188092",
      tool_id: tool,
      amount_usdt: amount,
    });
    console.log(`Bought ${tool} ($${amount})`);
  }

  // Submit result
  await post(`/tasks/${task1.id}/submit`, {
    agent_address: "0x854d98155f25f5A294cc3522472019FD07188092",
    result: `# Tesla Stock Performance Analysis

## Executive Summary
Tesla (TSLA) trades at $342.17, up 0.69% with strong volume at 98.2M shares. Analyst consensus remains bullish with a 12-month target of $380.

## Stock Data
- **Price:** $342.17 | **Change:** +$2.34 (0.69%)
- **Day Range:** $335.33 - $349.01
- **Volume:** 98.2M (above 90-day average)

## Key Findings
- 73% of enterprises adopting AI-related technologies
- EV market growing at 22.5% CAGR to $47.3B
- Tesla maintains 18% global EV market share

## Quarterly Performance
Q1: $200 | Q2: $250 | Q3: $240 | Q4: $342

## Cost Summary
- stock-data: $0.10
- web-search: $0.05
- chart-gen: $0.05
- **Total:** $0.20`,
  });
  console.log("Submitted");

  // Approve
  await post(`/tasks/${task1.id}/approve`, {});
  console.log("Approved (payment + attestation)");

  // Create task 2: open bounty
  console.log("\n--- Task 2: Open bounty ---");
  const task2 = await post("/tasks", {
    title: "Research AI agent market trends 2026",
    description:
      "Search for latest AI agent industry reports, get trending news, and translate key findings to Chinese",
    bounty_usdt: 0.5,
    required_capabilities: ["web-search", "news", "translate"],
    creator_address: "0xDemoUser",
  });
  console.log("Created:", task2.title);

  // Create task 3: another open bounty
  console.log("\n--- Task 3: Open bounty ---");
  const task3 = await post("/tasks", {
    title: "Compare top 5 cloud GPU providers pricing",
    description:
      "Search for current pricing of AWS, GCP, Azure, Lambda Labs, and CoreWeave GPU instances",
    bounty_usdt: 0.75,
    required_capabilities: ["web-search"],
    creator_address: "0xDemoUser",
  });
  console.log("Created:", task3.title);

  // Print final state
  console.log("\n--- Final Metrics ---");
  const metrics = await get("/tasks/api/metrics");
  console.log(JSON.stringify(metrics, null, 2));
}

main().catch(console.error);
