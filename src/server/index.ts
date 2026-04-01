import express from "express";
import cors from "cors";
import { config } from "../shared/config.js";
import { createPaymentMiddleware } from "./middleware/x402.js";
import { toolRoutes, toolPaymentConfig } from "./routes/tools/index.js";
import { taskRoutes } from "./routes/tasks.js";
import "./db/index.js";

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "agent-economy" });
});

// x402 payment middleware for tool endpoints
app.use(createPaymentMiddleware(toolPaymentConfig));

// Tool API routes
app.use("/tools", toolRoutes);

// Task board routes
app.use("/tasks", taskRoutes);

// Tool discovery (no payment required)
app.get("/tools/discover", (_req, res) => {
  res.json({
    tools: [
      {
        id: "stock-data",
        name: "Stock Data API",
        description: "Real-time stock prices and market data",
        endpoint: "/tools/stock-data",
        price: "$0.10",
        method: "GET",
        params: { symbol: "Stock ticker symbol (e.g. TSLA)" },
      },
      {
        id: "web-search",
        name: "Web Search API",
        description: "Search the web and return summarized results",
        endpoint: "/tools/web-search",
        price: "$0.05",
        method: "GET",
        params: { q: "Search query" },
      },
      {
        id: "chart-gen",
        name: "Chart Generation API",
        description: "Generate charts from data",
        endpoint: "/tools/chart-gen",
        price: "$0.05",
        method: "POST",
        params: {
          title: "Chart title",
          type: "line | bar | pie",
          labels: "Array of labels",
          data: "Array of values",
        },
      },
      {
        id: "translate",
        name: "Translation API",
        description: "Translate text between languages",
        endpoint: "/tools/translate",
        price: "$0.02",
        method: "POST",
        params: {
          text: "Text to translate",
          from: "Source language code",
          to: "Target language code",
        },
      },
      {
        id: "news",
        name: "News API",
        description: "Latest news headlines by topic",
        endpoint: "/tools/news",
        price: "$0.03",
        method: "GET",
        params: { topic: "News topic" },
      },
    ],
  });
});

app.listen(config.port, () => {
  console.log(`AgentEconomy server running on http://localhost:${config.port}`);
  console.log(`Tool discovery: http://localhost:${config.port}/tools/discover`);
});
