import pino from "pino";
import { env } from "../config/env.js";
import { getCorrelationId } from "../context/request-context.js";

const redact: pino.LoggerOptions["redact"] = {
  paths: [
    "req.headers.authorization",
    "req.headers.cookie",
    "*.password",
    "*.passwordHash",
    "*.token",
    "*.refreshToken",
    "*.accessToken",
    "*.creditCard",
  ],
  censor: "[REDACTED]",
};

const mixin = () => {
  const correlationId = getCorrelationId();
  return correlationId ? { correlationId } : {};
};

const options: pino.LoggerOptions =
  env.NODE_ENV !== "production"
    ? {
        level: "debug",
        mixin,
        redact,
        transport: { target: "pino-pretty", options: { colorize: true } },
      }
    : {
        level: "info",
        mixin,
        redact,
      };

export const logger = pino(options);
