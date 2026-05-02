import { Router } from "express";
import { kitePrice } from "../../../shared/x402-helpers.js";
import { stockDataHandler } from "./stock-data.js";
import { webSearchHandler } from "./web-search.js";
import { chartGenHandler } from "./chart-gen.js";
import { translateHandler } from "./translate.js";
import { newsHandler } from "./news.js";

export const toolRoutes = Router();

// Discovery endpoint — no payment required
toolRoutes.get("/discover", (_req, res) => {
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

toolRoutes.get("/stock-data", stockDataHandler);
toolRoutes.get("/web-search", webSearchHandler);
toolRoutes.post("/chart-gen", chartGenHandler);
toolRoutes.post("/translate", translateHandler);
toolRoutes.get("/news", newsHandler);

// x402 payment config for each tool endpoint
export const toolPaymentConfig = {
  "GET /tools/stock-data": {
    accepts: kitePrice(0.1),
    description: "Stock market data",
    mimeType: "application/json",
  },
  "GET /tools/web-search": {
    accepts: kitePrice(0.05),
    description: "Web search results",
    mimeType: "application/json",
  },
  "POST /tools/chart-gen": {
    accepts: kitePrice(0.05),
    description: "Chart generation",
    mimeType: "application/json",
  },
  "POST /tools/translate": {
    accepts: kitePrice(0.02),
    description: "Translation service",
    mimeType: "application/json",
  },
  "GET /tools/news": {
    accepts: kitePrice(0.03),
    description: "News headlines",
    mimeType: "application/json",
  },
};
