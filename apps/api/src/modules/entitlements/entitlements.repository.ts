import { eq, and, or, isNull, gt } from "drizzle-orm";
import type { Db } from "../../shared/db/index.js";
import { entitlements } from "../../shared/db/schema/index.js";

export class EntitlementsRepository {
  constructor(private readonly db: Db) {}

  async findActiveEntitlement(userId: string, resourceType: string, resourceId: string) {
    const now = new Date();
    return this.db.query.entitlements.findFirst({
      where: and(
        eq(entitlements.userId, userId),
        eq(entitlements.resourceType, resourceType as "PLAN" | "COURSE" | "BUNDLE"),
        eq(entitlements.resourceId, resourceId),
        isNull(entitlements.revokedAt),
        or(isNull(entitlements.validUntil), gt(entitlements.validUntil, now)),
      ),
    });
  }

  async findActivePlanEntitlement(userId: string) {
    const now = new Date();
    return this.db.query.entitlements.findFirst({
      where: and(
        eq(entitlements.userId, userId),
        eq(entitlements.resourceType, "PLAN"),
        isNull(entitlements.revokedAt),
        or(isNull(entitlements.validUntil), gt(entitlements.validUntil, now)),
      ),
    });
  }

  async createEntitlement(data: {
    userId: string;
    resourceType: "PLAN" | "COURSE" | "BUNDLE";
    resourceId: string;
    source: "SUBSCRIPTION" | "ONE_TIME_PURCHASE" | "GIFT" | "ADMIN_GRANT";
    referenceId?: string | undefined;
    validFrom?: Date | undefined;
    validUntil?: Date | undefined;
  }) {
    const [entitlement] = await this.db
      .insert(entitlements)
      .values(data)
      .returning();
    if (!entitlement) throw new Error("Failed to create entitlement");
    return entitlement;
  }

  async revokeByReference(referenceId: string) {
    await this.db
      .update(entitlements)
      .set({ revokedAt: new Date(), revokedReason: "subscription_cancelled" })
      .where(
        and(
          eq(entitlements.referenceId, referenceId),
          isNull(entitlements.revokedAt),
        ),
      );
  }

  async revokeAllForUser(userId: string) {
    await this.db
      .update(entitlements)
      .set({ revokedAt: new Date(), revokedReason: "admin_revoke" })
      .where(and(eq(entitlements.userId, userId), isNull(entitlements.revokedAt)));
  }
}
