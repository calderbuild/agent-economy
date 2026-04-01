/**
 * Tool caller: makes HTTP requests to paid tool APIs.
 * In production, this would use x402 fetch wrapper for automatic payment.
 * For MVP without funded wallets, it calls tools directly (bypassing payment).
 */

interface Tool {
  id: string;
  endpoint: string;
  method: string;
}

export async function callTool(
  serverUrl: string,
  tool: Tool,
  params: Record<string, string>,
): Promise<unknown> {
  const url = new URL(serverUrl + tool.endpoint);

  if (tool.method === "GET") {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    // Direct call (bypassing x402 for local dev)
    // In production, this would use wrapFetchWithPaymentFromConfig
    const res = await fetch(url.toString());

    if (res.status === 402) {
      // x402 paywall active - for demo, call the internal endpoint directly
      // This simulates a successful payment
      console.log(
        `  [ToolCaller] Got 402 for ${tool.id}, simulating payment...`,
      );
      return simulateToolResponse(tool.id, params);
    }

    return res.json();
  }

  // POST request
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (res.status === 402) {
    console.log(`  [ToolCaller] Got 402 for ${tool.id}, simulating payment...`);
    return simulateToolResponse(tool.id, params);
  }

  return res.json();
}

/**
 * Simulate tool responses when x402 paywall blocks the request.
 * This allows the agent to function in local dev without funded wallets.
 */
function simulateToolResponse(
  toolId: string,
  params: Record<string, string>,
): unknown {
  switch (toolId) {
    case "stock-data":
      return {
        symbol: params.symbol || "TSLA",
        price: 342.17,
        change: 2.34,
        changePercent: "0.69%",
        volume: "98.2M",
        high: 349.01,
        low: 335.33,
        timestamp: new Date().toISOString(),
        source: "AgentEconomy Market Data",
      };

    case "web-search":
      return {
        query: params.q || "search",
        resultCount: 5,
        results: [
          {
            title: `${params.q} - Comprehensive Analysis 2026`,
            url: `https://example.com/analysis`,
            snippet: `A detailed overview of ${params.q} including market trends and future projections.`,
          },
          {
            title: `Understanding ${params.q}: A Complete Guide`,
            url: `https://example.com/guide`,
            snippet: `Everything you need to know about ${params.q}. Market size estimated at $47.3B with 22.5% CAGR.`,
          },
          {
            title: `${params.q} Industry Report - Q1 2026`,
            url: `https://example.com/report`,
            snippet: `Key findings: 73% of enterprises are adopting ${params.q}-related technologies.`,
          },
        ],
        timestamp: new Date().toISOString(),
      };

    case "chart-gen":
      return {
        chartId: `chart-${Date.now()}`,
        title: params.title || "Chart",
        type: params.type || "bar",
        textRepresentation: `${params.title || "Chart"}\n${"─".repeat(40)}\n  Q1  ████████████████████ 100\n  Q2  ██████████████████████████████ 150\n  Q3  ██████████████████████████ 130\n  Q4  ████████████████████████████████████ 180`,
        timestamp: new Date().toISOString(),
      };

    case "translate":
      return {
        originalText: params.text || "",
        translatedText: `[${params.to || "zh"}] ${params.text || ""}`,
        from: params.from || "en",
        to: params.to || "zh",
        confidence: 0.92,
        timestamp: new Date().toISOString(),
      };

    case "news":
      return {
        topic: params.topic || "technology",
        articles: [
          {
            title: "AI Agents Now Handle 30% of Enterprise Customer Service",
            summary:
              "Major enterprises report significant cost savings after deploying AI agent systems.",
            url: "https://example.com/news/1",
          },
          {
            title: "x402 Protocol Reaches 200M Transactions Milestone",
            summary:
              "The HTTP-native payment protocol continues to gain traction.",
            url: "https://example.com/news/2",
          },
        ],
        timestamp: new Date().toISOString(),
      };

    default:
      return { error: `Unknown tool: ${toolId}` };
  }
}
