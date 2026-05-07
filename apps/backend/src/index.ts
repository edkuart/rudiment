import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { env } from "./shared/config/env.js";
import { db } from "./shared/db/index.js";
import { sql } from "drizzle-orm";
import { requestLogger } from "./shared/middleware/request-logger.js";
import { errorHandler } from "./shared/middleware/error-handler.js";
import { logger } from "./shared/utils/logger.js";
import { authRouter } from "./modules/auth/auth.router.js";
import { billingRouter } from "./modules/billing/billing.router.js";
import { coursesRouter } from "./modules/courses/courses.router.js";
import { videoRouter, muxWebhookRouter } from "./modules/video/video.router.js";
import { mediaRouter } from "./modules/media/media.router.js";
import { progressRouter } from "./modules/progress/progress.router.js";
import { analyticsRouter } from "./modules/analytics/analytics.router.js";
import "./modules/entitlements/index.js";

const app = express();

// ─── Liveness check ───────────────────────────────────────────────────────────
// Railway health probes are server-to-server requests without an Origin header,
// so keep this route before browser-focused middleware like CORS.
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    hsts: { maxAge: 63_072_000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = new Set([env.WEB_URL]);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (origin && allowedOrigins.has(origin)) return cb(null, true);
      cb(new Error("CORS: origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    maxAge: 86_400,
  }),
);

// ─── Rate limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 60_000,
  max: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { type: "https://rudiment.pro/problems/rate-limited", title: "RATE LIMITED", status: 429, detail: "Too many requests" },
});

app.use(globalLimiter);

// ─── Body parsers ─────────────────────────────────────────────────────────────
// Keep global limit small. Stripe webhook uses express.raw() in its own router.
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());
app.use(requestLogger);

app.get("/ready", async (_req, res) => {
  if (!env.DATABASE_URL) {
    res.status(503).json({
      status: "degraded",
      db: "missing DATABASE_URL",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: "ok", db: "ok", timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "degraded", db: "error", timestamp: new Date().toISOString() });
  }
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/billing", billingRouter);
app.use("/api/v1/courses", coursesRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/media", mediaRouter);
app.use("/api/v1/progress", progressRouter);
app.use("/api/v1/analytics", analyticsRouter);
app.use("/api/v1/webhooks/mux", muxWebhookRouter);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).contentType("application/problem+json").json({
    type: "https://rudiment.pro/problems/not-found",
    title: "NOT FOUND",
    status: 404,
    detail: "The requested route does not exist",
  });
});

app.use(errorHandler);

// ─── Server ───────────────────────────────────────────────────────────────────
const host = "0.0.0.0";
const server = app.listen(env.PORT, host, () => {
  logger.info(`Rudiment API running on ${host}:${env.PORT} [${env.NODE_ENV}]`);
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
function shutdown(signal: string) {
  logger.info({ signal }, "Shutdown signal received — closing server");
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });

  // Force exit if connections don't drain within 10s
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught exception — shutting down");
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  logger.fatal({ reason }, "Unhandled promise rejection — shutting down");
  process.exit(1);
});

export default app;
