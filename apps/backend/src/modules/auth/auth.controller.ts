import type { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "./auth.schema.js";
import type { AuthService } from "./auth.service.js";
import { env } from "../../shared/config/env.js";

const ACCESS_COOKIE = "rudiment_access";
const REFRESH_COOKIE = "rudiment_refresh";
const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;
const COOKIE_SAME_SITE: "none" | "lax" = isCrossSiteDeployment() ? "none" : "lax";

function isCrossSiteDeployment(): boolean {
  try {
    const apiUrl = new URL(env.API_URL);
    const webUrl = new URL(env.WEB_URL);
    return apiUrl.protocol !== webUrl.protocol || apiUrl.hostname !== webUrl.hostname;
  } catch {
    return env.NODE_ENV === "production";
  }
}

const SHARED_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: COOKIE_SAME_SITE,
};

const ACCESS_COOKIE_OPTIONS = {
  ...SHARED_COOKIE_OPTIONS,
  path: "/",
  maxAge: ACCESS_COOKIE_MAX_AGE,
};

const REFRESH_COOKIE_OPTIONS = {
  ...SHARED_COOKIE_OPTIONS,
  path: "/api/v1/auth",
  maxAge: REFRESH_COOKIE_MAX_AGE,
};

export class AuthController {
  constructor(private readonly service: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { body } = registerSchema.parse({ body: req.body });
      const meta = { deviceInfo: req.headers["user-agent"], ipAddress: req.ip };

      const { user, tokens, refreshToken } = await this.service.register(body, meta);

      res.cookie(ACCESS_COOKIE, tokens.accessToken, ACCESS_COOKIE_OPTIONS);
      res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);
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

      res.cookie(ACCESS_COOKIE, tokens.accessToken, ACCESS_COOKIE_OPTIONS);
      res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);
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

      res.cookie(ACCESS_COOKIE, tokens.accessToken, ACCESS_COOKIE_OPTIONS);
      res.cookie(REFRESH_COOKIE, newRefreshToken, REFRESH_COOKIE_OPTIONS);
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
      res.clearCookie(ACCESS_COOKIE, ACCESS_COOKIE_OPTIONS);
      res.clearCookie(REFRESH_COOKIE, REFRESH_COOKIE_OPTIONS);
      res.json({ data: { message: "Logged out successfully" } });
    } catch (err) {
      next(err);
    }
  };

  logoutAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.logoutAll(req.user!.id);
      res.clearCookie(ACCESS_COOKIE, ACCESS_COOKIE_OPTIONS);
      res.clearCookie(REFRESH_COOKIE, REFRESH_COOKIE_OPTIONS);
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

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await this.service.getProfile(req.user!.id);
      res.json({ data: profile });
    } catch (err) {
      next(err);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.updateProfile(req.user!.id, req.body);
      const updated = await this.service.getProfile(req.user!.id);
      res.json({ data: updated });
    } catch (err) {
      next(err);
    }
  };
}
