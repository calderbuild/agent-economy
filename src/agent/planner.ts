/**
 * Task planner: determines which tools to use for a given task.
 * Uses Claude API when available, falls back to keyword matching.
 */
import { config } from "../shared/config.js";

interface Task {
  title: string;
  description: string;
  required_capabilities: string;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  price: string;
  method: string;
  params: Record<string, string>;
}

export interface PlanStep {
  toolId: string;
  params: Record<string, string>;
  reason: string;
}

export interface TaskPlan {
  steps: PlanStep[];
  reasoning: string;
}

// Keyword-based tool matching as reliable fallback
const TOOL_KEYWORDS: Record<string, string[]> = {
  "stock-data": [
    "stock",
    "share",
    "market",
    "price",
    "ticker",
    "trading",
    "equity",
    "financial",
  ],
  "web-search": [
    "search",
    "research",
    "find",
    "look up",
    "investigate",
    "explore",
    "analyze",
  ],
  "chart-gen": ["chart", "graph", "visual", "plot", "diagram", "visualization"],
  translate: [
    "translate",
    "translation",
    "language",
    "chinese",
    "spanish",
    "french",
  ],
  news: ["news", "headline", "latest", "current events", "trending"],
};

function keywordPlan(task: Task, tools: Tool[]): TaskPlan {
  const text = `${task.title} ${task.description}`.toLowerCase();
  const capabilities: string[] = JSON.parse(task.required_capabilities || "[]");
  const steps: PlanStep[] = [];

  // First, add tools matching required_capabilities
  for (const cap of capabilities) {
    const tool = tools.find((t) => t.id === cap);
    if (tool) {
      const params = inferParams(tool, task);
      steps.push({
        toolId: tool.id,
        params,
        reason: `Required capability: ${cap}`,
      });
    }
  }

  // Then, add tools matching keywords (if not already added)
  for (const [toolId, keywords] of Object.entries(TOOL_KEYWORDS)) {
    if (steps.some((s) => s.toolId === toolId)) continue;
    if (keywords.some((kw) => text.includes(kw))) {
      const tool = tools.find((t) => t.id === toolId);
      if (tool) {
        const params = inferParams(tool, task);
        steps.push({
          toolId,
          params,
          reason: `Keyword match in task description`,
        });
      }
    }
  }

  // Ensure at least web-search is included for research tasks
  if (steps.length === 0) {
    const searchTool = tools.find((t) => t.id === "web-search");
    if (searchTool) {
      steps.push({
        toolId: "web-search",
        params: { q: task.title },
        reason: "Default: search for task topic",
      });
    }
  }

  return {
    steps,
    reasoning: `Keyword-based plan: ${steps.length} tools selected based on task description and required capabilities.`,
  };
}

function inferParams(tool: Tool, task: Task): Record<string, string> {
  const params: Record<string, string> = {};
  const text = `${task.title} ${task.description}`;

  switch (tool.id) {
    case "stock-data": {
      // Extract stock symbol from text
      const match = text.match(/\b([A-Z]{2,5})\b/);
      params.symbol = match ? match[1] : "TSLA";
      break;
    }
    case "web-search":
      params.q = task.title;
      break;
    case "chart-gen":
      params.title = task.title;
      params.type = "bar";
      params.labels = JSON.stringify(["Q1", "Q2", "Q3", "Q4"]);
      params.data = JSON.stringify([100, 150, 130, 180]);
      break;
    case "translate":
      params.text = task.description.slice(0, 200);
      params.to = "zh";
      break;
    case "news":
      params.topic = task.title.split(" ")[0] || "technology";
      break;
  }

  return params;
}

async function claudePlan(task: Task, tools: Tool[]): Promise<TaskPlan | null> {
  if (!config.anthropicApiKey) return null;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `You are an AI agent planning how to complete a task. Given the task and available tools, output a JSON plan.

Task: ${task.title}
Description: ${task.description}
Required capabilities: ${task.required_capabilities}

Available tools:
${tools.map((t) => `- ${t.id}: ${t.description} (${t.price}, ${t.method}, params: ${JSON.stringify(t.params)})`).join("\n")}

Output ONLY valid JSON in this format (no markdown, no explanation):
{
  "steps": [
    {"toolId": "tool-id", "params": {"key": "value"}, "reason": "why this tool"}
  ],
  "reasoning": "overall approach"
}`,
          },
        ],
      }),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };
    const text = data.content.find((c) => c.type === "text")?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    return JSON.parse(jsonMatch[0]) as TaskPlan;
  } catch {
    return null;
  }
}

export async function planTask(task: Task, tools: Tool[]): Promise<TaskPlan> {
  // Try Claude first, fall back to keyword matching
  const claudeResult = await claudePlan(task, tools);
  if (claudeResult) {
    console.log("[Planner] Using Claude API plan");
    return claudeResult;
  }

  console.log("[Planner] Using keyword-based plan (Claude API not available)");
  return keywordPlan(task, tools);
}
