import { eq, and, gt, isNull } from "drizzle-orm";
import type { Db } from "../../shared/db/index.js";
import { users, profiles, sessions } from "../../shared/db/schema/index.js";
import type { RegisterInput } from "./auth.types.js";

export class AuthRepository {
  constructor(private readonly db: Db) {}

  async findUserByEmail(email: string) {
    return this.db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });
  }

  async findUserById(id: string) {
    return this.db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  async createUser(input: RegisterInput & { passwordHash: string }) {
    const [user] = await this.db
      .insert(users)
      .values({
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash,
        displayName: input.displayName,
      })
      .returning();

    if (!user) throw new Error("Failed to create user");

    await this.db.insert(profiles).values({ userId: user.id });

    return user;
  }

  async updateLastSeen(userId: string) {
    await this.db
      .update(users)
      .set({ lastSeenAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updateProfile(
    userId: string,
    data: {
      displayName?: string | undefined;
      avatarUrl?: string | undefined;
      bio?: string | undefined;
      skillLevel?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | undefined;
      timezone?: string | undefined;
    },
  ) {
    const { displayName, avatarUrl, bio, skillLevel, timezone } = data;
    const now = new Date();

    if (displayName !== undefined || avatarUrl !== undefined) {
      await this.db
        .update(users)
        .set({
          ...(displayName !== undefined ? { displayName } : {}),
          ...(avatarUrl !== undefined ? { avatarUrl } : {}),
          updatedAt: now,
        })
        .where(eq(users.id, userId));
    }

    if (bio !== undefined || skillLevel !== undefined || timezone !== undefined) {
      await this.db
        .update(profiles)
        .set({
          ...(bio !== undefined ? { bio } : {}),
          ...(skillLevel !== undefined ? { skillLevel } : {}),
          ...(timezone !== undefined ? { timezone } : {}),
          updatedAt: now,
        })
        .where(eq(profiles.userId, userId));
    }
  }

  async getProfile(userId: string) {
    return this.db.query.profiles.findFirst({
      where: eq(profiles.userId, userId),
    });
  }

  async createSession(data: {
    userId: string;
    tokenHash: string;
    familyId: string;
    expiresAt: Date;
    deviceInfo?: string | undefined;
    ipAddress?: string | undefined;
  }) {
    const [session] = await this.db.insert(sessions).values(data).returning();
    if (!session) throw new Error("Failed to create session");
    return session;
  }

  // Returns the session only if it has never been used/rotated and not revoked.
  async findActiveSession(tokenHash: string) {
    return this.db.query.sessions.findFirst({
      where: and(
        eq(sessions.tokenHash, tokenHash),
        isNull(sessions.usedAt),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, new Date()),
      ),
    });
  }

  // Returns ANY session by hash (including used/revoked) — for reuse detection.
  async findSessionByHash(tokenHash: string) {
    return this.db.query.sessions.findFirst({
      where: eq(sessions.tokenHash, tokenHash),
    });
  }

  // Mark a session as rotated (consumed). Distinct from revocation (logout).
  async markSessionUsed(tokenHash: string) {
    await this.db
      .update(sessions)
      .set({ usedAt: new Date() })
      .where(eq(sessions.tokenHash, tokenHash));
  }

  // Revoke all sessions in a family — called when token reuse is detected.
  async revokeFamilySessions(familyId: string) {
    await this.db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(sessions.familyId, familyId), isNull(sessions.revokedAt)));
  }

  async revokeSession(tokenHash: string) {
    await this.db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.tokenHash, tokenHash));
  }

  async revokeAllUserSessions(userId: string) {
    await this.db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
  }

  async countActiveSessions(userId: string): Promise<number> {
    const result = await this.db.query.sessions.findMany({
      where: and(
        eq(sessions.userId, userId),
        isNull(sessions.usedAt),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, new Date()),
      ),
      columns: { id: true },
    });
    return result.length;
  }
}
