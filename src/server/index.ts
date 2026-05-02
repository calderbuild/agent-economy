import express from "express";
import cors from "cors";
import { config } from "../shared/config.js";
import { createPaymentMiddleware } from "./middleware/x402.js";
import { toolRoutes, toolPaymentConfig } from "./routes/tools/index.js";
import { taskRoutes } from "./routes/tasks.js";
import "./db/index.js";
import { initAttestation } from "./services/attestation.js";

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

// Initialize attestation service
initAttestation();

app.listen(config.port, () => {
  console.log(`AgentEconomy server running on http://localhost:${config.port}`);
  console.log(`Tool discovery: http://localhost:${config.port}/tools/discover`);
});
