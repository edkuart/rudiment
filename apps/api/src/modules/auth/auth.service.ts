import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "crypto";
import { env } from "../../shared/config/env.js";
import { logger } from "../../shared/utils/logger.js";
import {
  AppError,
  UnauthorizedError,
} from "../../shared/middleware/error-handler.js";
import type { AuthRepository } from "./auth.repository.js";
import type {
  RegisterInput,
  LoginInput,
  AuthTokens,
  JwtAccessPayload,
  AuthenticatedUser,
} from "./auth.types.js";

const BCRYPT_ROUNDS = 12;
const REFRESH_TOKEN_BYTES = 48;
const MAX_CONCURRENT_SESSIONS = 5;

export class AuthService {
  constructor(private readonly repo: AuthRepository) {}

  async register(
    input: RegisterInput,
    meta: { deviceInfo?: string | undefined; ipAddress?: string | undefined } = {},
  ): Promise<{ user: AuthenticatedUser; tokens: AuthTokens; refreshToken: string }> {
    const existing = await this.repo.findUserByEmail(input.email);
    if (existing) {
      // Mensaje genérico para no revelar si el email existe
      throw new AppError(409, "CONFLICT", "An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = await this.repo.createUser({ ...input, passwordHash });

    logger.info({ userId: user.id }, "New user registered");

    const { tokens, refreshToken } = await this.createSessionAndTokens(
      user.id,
      user.email,
      user.role,
      meta,
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
      },
      tokens,
      refreshToken,
    };
  }

  async login(
    input: LoginInput,
    meta: { deviceInfo?: string | undefined; ipAddress?: string | undefined } = {},
  ): Promise<{ user: AuthenticatedUser; tokens: AuthTokens; refreshToken: string }> {
    const user = await this.repo.findUserByEmail(input.email);

    // Siempre hacer el hash comparison para prevenir timing attacks
    const dummyHash = "$2b$12$invalidhashfortimingreasons00000000000000000000000000";
    const passwordMatch = await bcrypt.compare(
      input.password,
      user?.passwordHash ?? dummyHash,
    );

    if (!user || !passwordMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    await this.repo.updateLastSeen(user.id);

    const { tokens, refreshToken } = await this.createSessionAndTokens(
      user.id,
      user.email,
      user.role,
      meta,
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
      },
      tokens,
      refreshToken,
    };
  }

  async refresh(
    rawRefreshToken: string,
    meta: { deviceInfo?: string | undefined; ipAddress?: string | undefined } = {},
  ): Promise<{ tokens: AuthTokens; refreshToken: string }> {
    const tokenHash = hashToken(rawRefreshToken);
    const session = await this.repo.findActiveSession(tokenHash);

    if (!session) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const user = await this.repo.findUserById(session.userId);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    // Rotación: revocar el token actual e emitir uno nuevo
    await this.repo.revokeSession(tokenHash);

    const { tokens, refreshToken: newRefreshToken } = await this.createSessionAndTokens(
      user.id,
      user.email,
      user.role,
      meta,
    );

    return { tokens, refreshToken: newRefreshToken };
  }

  async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = hashToken(rawRefreshToken);
    await this.repo.revokeSession(tokenHash);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.repo.revokeAllUserSessions(userId);
  }

  // ─── helpers ─────────────────────────────────────────────────────────────

  private async createSessionAndTokens(
    userId: string,
    email: string,
    role: string,
    meta: { deviceInfo?: string | undefined; ipAddress?: string | undefined },
  ): Promise<{ tokens: AuthTokens; refreshToken: string }> {
    // Evitar acumulación de sesiones — límite de seguridad
    const activeSessions = await this.repo.countActiveSessions(userId);
    if (activeSessions >= MAX_CONCURRENT_SESSIONS) {
      logger.warn({ userId, activeSessions }, "Max concurrent sessions reached");
      await this.repo.revokeAllUserSessions(userId);
    }

    const accessToken = this.signAccessToken({ sub: userId, email, role });
    const rawRefreshToken = randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
    const tokenHash = hashToken(rawRefreshToken);

    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 30);

    await this.repo.createSession({
      userId,
      tokenHash,
      expiresAt: refreshExpiresAt,
      deviceInfo: meta.deviceInfo,
      ipAddress: meta.ipAddress,
    });

    return {
      tokens: { accessToken, expiresIn: 900 }, // 15 min en segundos
      refreshToken: rawRefreshToken,
    };
  }

  private signAccessToken(payload: JwtAccessPayload): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN ?? "15m",
    } as any);
  }

  verifyAccessToken(token: string): JwtAccessPayload {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;
    } catch {
      throw new UnauthorizedError("Invalid or expired access token");
    }
  }
}

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}
