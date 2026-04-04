/**
 * Tool caller: makes HTTP requests to paid tool APIs via x402 micropayments.
 * Uses @x402/fetch wrapper for automatic 402 detection, payment signing, and retry.
 * Falls back to simulated responses when wallet is unfunded or payment fails.
 */
import { wrapFetchWithPaymentFromConfig } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";
import { config, KITE_NETWORK } from "../shared/config.js";

interface Tool {
  id: string;
  endpoint: string;
  method: string;
}

// Initialize x402 fetch client (if private key is available)
let x402Fetch: typeof fetch | null = null;

try {
  if (config.agentPrivateKey) {
    const account = privateKeyToAccount(
      config.agentPrivateKey as `0x${string}`
    );
    x402Fetch = wrapFetchWithPaymentFromConfig(fetch, {
      schemes: [
        {
          network: KITE_NETWORK,
          client: new ExactEvmScheme(account),
        },
      ],
    });
    console.log("[ToolCaller] x402 payment client initialized");
  }
} catch (err) {
  console.log(
    "[ToolCaller] Failed to initialize x402 client, using mock fallback:",
    (err as Error).message
  );
}

export async function callTool(
  serverUrl: string,
  tool: Tool,
  params: Record<string, string>
): Promise<unknown> {
  const url = new URL(serverUrl + tool.endpoint);

  try {
    if (tool.method === "GET") {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }

      // Try x402 payment first
      if (x402Fetch) {
        console.log(`  [ToolCaller] Calling ${tool.id} with x402 payment...`);
        try {
          const res = await x402Fetch(url.toString());
          if (res.ok) {
            console.log(
              `  [ToolCaller] x402 payment successful for ${tool.id}`
            );
            return res.json();
          }
          const body = await res.text().catch(() => "");
          console.log(
            `  [ToolCaller] x402 response: ${res.status}, body: ${body.slice(
              0,
              300
            )}`
          );
        } catch (x402Err) {
          console.log(
            `  [ToolCaller] x402 error for ${tool.id}: ${
              (x402Err as Error).message
            }`
          );
        }
      }

      // Direct call without payment (will get 402 from server)
      const res = await fetch(url.toString());
      if (res.ok) return res.json();

      // 402 or other error -> mock fallback
      console.log(
        `  [ToolCaller] Got ${res.status} for ${tool.id}, using mock data`
      );
      return simulateToolResponse(tool.id, params);
    }

    // POST request
    if (x402Fetch) {
      console.log(
        `  [ToolCaller] Calling ${tool.id} (POST) with x402 payment...`
      );
      const res = await x402Fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        console.log(`  [ToolCaller] x402 payment successful for ${tool.id}`);
        return res.json();
      }
      console.log(
        `  [ToolCaller] x402 response: ${res.status}, falling back to mock`
      );
    }

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (res.ok) return res.json();

    console.log(
      `  [ToolCaller] Got ${res.status} for ${tool.id}, using mock data`
    );
    return simulateToolResponse(tool.id, params);
  } catch (err) {
    console.log(
      `  [ToolCaller] Error calling ${tool.id}: ${
        (err as Error).message
      }, using mock data`
    );
    return simulateToolResponse(tool.id, params);
  }
}

/**
 * Simulate tool responses when x402 payment fails or wallet is unfunded.
 */
function simulateToolResponse(
  toolId: string,
  params: Record<string, string>
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
        resultCount: 3,
        results: [
          {
            title: `${params.q} - Comprehensive Analysis 2026`,
            url: "https://example.com/analysis",
            snippet: `A detailed overview of ${params.q} including market trends and future projections.`,
          },
          {
            title: `Understanding ${params.q}: A Complete Guide`,
            url: "https://example.com/guide",
            snippet: `Everything you need to know about ${params.q}. Market size estimated at $47.3B.`,
          },
          {
            title: `${params.q} Industry Report - Q1 2026`,
            url: "https://example.com/report",
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
        textRepresentation: [
          params.title || "Chart",
          "-".repeat(40),
          "  Q1  ████████████████████ 100",
          "  Q2  ██████████████████████████████ 150",
          "  Q3  ██████████████████████████ 130",
          "  Q4  ████████████████████████████████████ 180",
        ].join("\n"),
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
              "Major enterprises report cost savings after deploying AI agent systems.",
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
