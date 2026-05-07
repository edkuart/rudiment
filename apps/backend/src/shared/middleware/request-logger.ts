import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { logger } from "../utils/logger.js";
import { requestContext } from "../context/request-context.js";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const correlationId =
    (req.headers["x-request-id"] as string | undefined) ?? randomUUID();

  res.setHeader("x-request-id", correlationId);

  const start = Date.now();

  // Run the rest of the request inside the AsyncLocalStorage context so that
  // any logger call in any service/repository automatically has the correlationId.
  requestContext.run({ correlationId }, () => {
    res.on("finish", () => {
      logger.info({
        correlationId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: Date.now() - start,
      });
    });

    next();
  });
}
