import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash, randomBytes, randomUUID } from "crypto";
import { env } from "../../shared/config/env.js";
import { logger } from "../../shared/utils/logger.js";
import { sendEmail } from "../../shared/email/email.client.js";
import { welcomeEmail } from "../../shared/email/templates/welcome.js";
import { AppError, UnauthorizedError } from "../../shared/middleware/error-handler.js";
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
      throw new AppError(409, "CONFLICT", "An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = await this.repo.createUser({ ...input, passwordHash });

    logger.info({ userId: user.id }, "New user registered");

    // Fire-and-forget welcome email — never block registration if email fails.
    void sendEmail({
      to: user.email,
      subject: "Welcome to Rudiment 🥁",
      html: welcomeEmail(user.displayName, env.WEB_URL),
    });

    const { tokens, refreshToken } = await this.createSessionAndTokens(
      user.id,
      user.email,
      user.role,
      meta,
    );

    return {
      user: { id: user.id, email: user.email, role: user.role, displayName: user.displayName },
      tokens,
      refreshToken,
    };
  }

  async login(
    input: LoginInput,
    meta: { deviceInfo?: string | undefined; ipAddress?: string | undefined } = {},
  ): Promise<{ user: AuthenticatedUser; tokens: AuthTokens; refreshToken: string }> {
    const user = await this.repo.findUserByEmail(input.email);

    // Always run bcrypt to prevent timing attacks even when user doesn't exist.
    const dummyHash = "$2b$12$invalidhashfortimingreasons00000000000000000000000000";
    const passwordMatch = await bcrypt.compare(input.password, user?.passwordHash ?? dummyHash);

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
      user: { id: user.id, email: user.email, role: user.role, displayName: user.displayName },
      tokens,
      refreshToken,
    };
  }

  async refresh(
    rawRefreshToken: string,
    meta: { deviceInfo?: string | undefined; ipAddress?: string | undefined } = {},
  ): Promise<{ tokens: AuthTokens; refreshToken: string }> {
    const tokenHash = hashToken(rawRefreshToken);

    // Look up the session — including used/revoked ones for reuse detection.
    const session = await this.repo.findSessionByHash(tokenHash);

    if (!session) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    // Token reuse detected: this session was already rotated.
    // Revoke the entire family — the refresh token was stolen and replayed.
    if (session.usedAt !== null) {
      logger.warn(
        { userId: session.userId, familyId: session.familyId },
        "Refresh token reuse detected — revoking entire session family",
      );
      await this.repo.revokeFamilySessions(session.familyId);
      throw new UnauthorizedError("Token reuse detected. Please log in again.");
    }

    // Explicitly revoked (logout).
    if (session.revokedAt !== null) {
      throw new UnauthorizedError("Session has been revoked");
    }

    // Expired.
    if (session.expiresAt < new Date()) {
      throw new UnauthorizedError("Refresh token expired");
    }

    const user = await this.repo.findUserById(session.userId);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    // Mark current token as used (rotation), then issue a new one in the same family.
    await this.repo.markSessionUsed(tokenHash);

    const { tokens, refreshToken: newRefreshToken } = await this.createSessionAndTokens(
      user.id,
      user.email,
      user.role,
      meta,
      session.familyId,
    );

    return { tokens, refreshToken: newRefreshToken };
  }

  async updateProfile(
    userId: string,
    data: Parameters<typeof this.repo.updateProfile>[1],
  ): Promise<void> {
    await this.repo.updateProfile(userId, data);
  }

  async getProfile(userId: string) {
    const [user, profile] = await Promise.all([
      this.repo.findUserById(userId),
      this.repo.getProfile(userId),
    ]);
    return { ...user, profile };
  }

  async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = hashToken(rawRefreshToken);
    await this.repo.revokeSession(tokenHash);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.repo.revokeAllUserSessions(userId);
  }

  verifyAccessToken(token: string): JwtAccessPayload {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;
    } catch {
      throw new UnauthorizedError("Invalid or expired access token");
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private async createSessionAndTokens(
    userId: string,
    email: string,
    role: string,
    meta: { deviceInfo?: string | undefined; ipAddress?: string | undefined },
    existingFamilyId?: string | undefined,
  ): Promise<{ tokens: AuthTokens; refreshToken: string }> {
    // Enforce session limit BEFORE creating the new session to avoid race condition.
    // If at limit, revoke oldest sessions down to MAX-1, then create new one.
    const activeSessions = await this.repo.countActiveSessions(userId);
    if (activeSessions >= MAX_CONCURRENT_SESSIONS) {
      logger.warn({ userId, activeSessions }, "Max concurrent sessions reached — revoking all");
      await this.repo.revokeAllUserSessions(userId);
    }

    const accessToken = this.signAccessToken({ sub: userId, email, role });
    const rawRefreshToken = randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
    const tokenHash = hashToken(rawRefreshToken);
    const familyId = existingFamilyId ?? randomUUID();

    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 30);

    await this.repo.createSession({
      userId,
      tokenHash,
      familyId,
      expiresAt: refreshExpiresAt,
      deviceInfo: meta.deviceInfo,
      ipAddress: meta.ipAddress,
    });

    return {
      tokens: { accessToken, expiresIn: 900 },
      refreshToken: rawRefreshToken,
    };
  }

  private signAccessToken(payload: JwtAccessPayload): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN ?? "15m",
    } as any);
  }
}

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}
