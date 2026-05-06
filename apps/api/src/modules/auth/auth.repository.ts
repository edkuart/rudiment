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

    // Crear profile vacío en paralelo
    await this.db.insert(profiles).values({ userId: user.id });

    return user;
  }

  async updateLastSeen(userId: string) {
    await this.db
      .update(users)
      .set({ lastSeenAt: new Date() })
      .where(eq(users.id, userId));
  }

  async createSession(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    deviceInfo?: string | undefined;
    ipAddress?: string | undefined;
  }) {
    const [session] = await this.db
      .insert(sessions)
      .values(data)
      .returning();
    if (!session) throw new Error("Failed to create session");
    return session;
  }

  async findActiveSession(tokenHash: string) {
    return this.db.query.sessions.findFirst({
      where: and(
        eq(sessions.tokenHash, tokenHash),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, new Date()),
      ),
    });
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
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, new Date()),
      ),
      columns: { id: true },
    });
    return result.length;
  }
}
