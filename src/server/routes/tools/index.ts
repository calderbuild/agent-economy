import { Router } from "express";
import { kitePrice } from "../../../shared/x402-helpers.js";
import { stockDataHandler } from "./stock-data.js";
import { webSearchHandler } from "./web-search.js";
import { chartGenHandler } from "./chart-gen.js";
import { translateHandler } from "./translate.js";
import { newsHandler } from "./news.js";

export const toolRoutes = Router();

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
