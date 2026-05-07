import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { JwtAccessPayload } from "../../modules/auth/auth.types.js";

const ACCESS_COOKIE = "rudiment_access";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.[ACCESS_COOKIE] as string | undefined;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : cookieToken;

  if (!token) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Missing access token" } });
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      displayName: payload.displayName ?? "",
    };
    next();
  } catch {
    res
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "Invalid or expired access token" } });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: { code: "FORBIDDEN", message: "Insufficient permissions" } });
      return;
    }
    next();
  };
}
