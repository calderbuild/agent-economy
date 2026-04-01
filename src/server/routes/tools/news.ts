import type { Request, Response } from "express";

const MOCK_NEWS: Record<string, Array<{ title: string; summary: string }>> = {
  technology: [
    {
      title: "AI Agents Now Handle 30% of Enterprise Customer Service",
      summary:
        "Major enterprises report significant cost savings and improved customer satisfaction after deploying AI agent systems.",
    },
    {
      title: "x402 Protocol Reaches 200M Transactions Milestone",
      summary:
        "The HTTP-native payment protocol continues to gain traction, with Coinbase and Cloudflare driving adoption across developer tooling.",
    },
    {
      title: "MCP Ecosystem Expands to 10,000+ Servers",
      summary:
        "The Model Context Protocol sees explosive growth as developers build interconnected AI tool ecosystems.",
    },
  ],
  finance: [
    {
      title: "Fed Signals Potential Rate Cut in Q3 2026",
      summary:
        "Federal Reserve chairman hints at easing monetary policy as inflation approaches target levels.",
    },
    {
      title: "S&P 500 Hits New All-Time High Amid AI Boom",
      summary:
        "Technology stocks lead market rally as AI-driven productivity gains boost corporate earnings.",
    },
    {
      title: "Stablecoin Market Cap Surpasses $300B",
      summary:
        "USDC and USDT continue to dominate as institutional adoption accelerates.",
    },
  ],
  ai: [
    {
      title: "Claude 4.6 Sets New Benchmarks in Agent Reliability",
      summary:
        "Anthropic's latest model achieves 95% task completion rate on complex multi-step agent workflows.",
    },
    {
      title: "Enterprise AI Agent Spending Reaches $50B Annually",
      summary:
        "Companies invest heavily in autonomous agent systems for operations, customer service, and research.",
    },
    {
      title: "Multi-Agent Systems Face Reliability Challenges",
      summary:
        "Research shows accuracy degrades beyond 4 agents due to coordination overhead, pushing industry toward single-agent architectures.",
    },
  ],
};

export function newsHandler(req: Request, res: Response) {
  const topic = (req.query.topic as string)?.toLowerCase() || "technology";

  const articles = MOCK_NEWS[topic] || MOCK_NEWS.technology!;

  res.json({
    topic,
    articles: articles.map((a, i) => ({
      ...a,
      url: `https://example.com/news/${topic}/${i + 1}`,
      publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
    })),
    timestamp: new Date().toISOString(),
    source: "AgentEconomy News",
  });
}
