import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { env } from "./shared/config/env.js";
import { requestLogger } from "./shared/middleware/request-logger.js";
import { errorHandler } from "./shared/middleware/error-handler.js";
import { logger } from "./shared/utils/logger.js";
import { authRouter } from "./modules/auth/auth.router.js";
import { billingRouter } from "./modules/billing/billing.router.js";
import "./modules/entitlements/index.js"; // registra event listeners

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: [env.WEB_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);

app.use(
  rateLimit({
    windowMs: 60_000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { code: "RATE_LIMIT", message: "Too many requests" } },
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/billing", billingRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } });
});

app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`🥁 Rudiment API running on port ${env.PORT} [${env.NODE_ENV}]`);
});

export default app;
