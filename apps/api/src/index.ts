import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { env } from "./shared/config/env.js";
import { requestLogger } from "./shared/middleware/request-logger.js";
import { errorHandler } from "./shared/middleware/error-handler.js";
import { logger } from "./shared/utils/logger.js";

const app = express();

// Security headers
app.use(helmet());

// CORS — only allow our frontend
app.use(
  cors({
    origin: [env.WEB_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);

// Global rate limiting
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { code: "RATE_LIMIT", message: "Too many requests" } },
  }),
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging + correlation ID
app.use(requestLogger);

// Health check — no auth required
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes — modules will be registered here in Phase 2+
app.use("/api/v1", (_req, res) => {
  res.json({ message: "Rudiment API v1 — ready" });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } });
});

// Global error handler (must be last)
app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`🥁 Rudiment API running on port ${env.PORT} [${env.NODE_ENV}]`);
});

export default app;
