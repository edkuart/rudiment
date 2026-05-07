import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../utils/logger.js";
import { getCorrelationId } from "../context/request-context.js";

const API_BASE = "https://rudiment.pro/problems";

// ─── Error classes ────────────────────────────────────────────────────────────

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly extensions: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(404, "NOT_FOUND", `${resource} not found`);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(403, "FORBIDDEN", message);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: Record<string, unknown>) {
    super(422, "VALIDATION_ERROR", message, details ? { errors: details } : {});
  }
}

// ─── RFC 9457 Problem Details response ────────────────────────────────────────

function problem(
  res: Response,
  status: number,
  code: string,
  detail: string,
  instance: string,
  extensions: Record<string, unknown> = {},
): void {
  const correlationId = getCorrelationId();
  res
    .status(status)
    .contentType("application/problem+json")
    .json({
      type: `${API_BASE}/${code.toLowerCase().replace(/_/g, "-")}`,
      title: code.replace(/_/g, " "),
      status,
      detail,
      instance,
      correlationId,
      ...extensions,
    });
}

// ─── Global error handler ─────────────────────────────────────────────────────

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const instance = req.path;

  if (err instanceof ZodError) {
    problem(res, 422, "VALIDATION_ERROR", "Invalid request data", instance, {
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof AppError) {
    problem(res, err.statusCode, err.code, err.message, instance, err.extensions);
    return;
  }

  logger.error({ err }, "Unhandled error");

  problem(res, 500, "INTERNAL_ERROR", "An unexpected error occurred", instance, {
    ...(process.env["NODE_ENV"] !== "production" && { stack: err.stack }),
  });
}
