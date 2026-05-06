import type { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "./auth.schema.js";
import type { AuthService } from "./auth.service.js";

const REFRESH_COOKIE = "rudiment_refresh";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env["NODE_ENV"] === "production",
  sameSite: "strict" as const,
  path: "/api/v1/auth",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días en ms
};

export class AuthController {
  constructor(private readonly service: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { body } = registerSchema.parse({ body: req.body });
      const meta = { deviceInfo: req.headers["user-agent"], ipAddress: req.ip };

      const { user, tokens, refreshToken } = await this.service.register(body, meta);

      res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
      res.status(201).json({ data: { user, ...tokens } });
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { body } = loginSchema.parse({ body: req.body });
      const meta = { deviceInfo: req.headers["user-agent"], ipAddress: req.ip };

      const { user, tokens, refreshToken } = await this.service.login(body, meta);

      res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
      res.json({ data: { user, ...tokens } });
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawRefreshToken = req.cookies[REFRESH_COOKIE] as string | undefined;
      if (!rawRefreshToken) {
        res.status(401).json({ error: { code: "UNAUTHORIZED", message: "No refresh token" } });
        return;
      }

      const meta = { deviceInfo: req.headers["user-agent"], ipAddress: req.ip };
      const { tokens, refreshToken: newRefreshToken } = await this.service.refresh(
        rawRefreshToken,
        meta,
      );

      res.cookie(REFRESH_COOKIE, newRefreshToken, COOKIE_OPTIONS);
      res.json({ data: tokens });
    } catch (err) {
      next(err);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawRefreshToken = req.cookies[REFRESH_COOKIE] as string | undefined;
      if (rawRefreshToken) {
        await this.service.logout(rawRefreshToken);
      }
      res.clearCookie(REFRESH_COOKIE, { path: COOKIE_OPTIONS.path });
      res.json({ data: { message: "Logged out successfully" } });
    } catch (err) {
      next(err);
    }
  };

  logoutAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.logoutAll(req.user!.id);
      res.clearCookie(REFRESH_COOKIE, { path: COOKIE_OPTIONS.path });
      res.json({ data: { message: "All sessions revoked" } });
    } catch (err) {
      next(err);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({ data: req.user });
    } catch (err) {
      next(err);
    }
  };
}
