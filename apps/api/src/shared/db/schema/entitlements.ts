import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./users.js";

export const entitlementSourceEnum = pgEnum("entitlement_source", [
  "SUBSCRIPTION",
  "ONE_TIME_PURCHASE",
  "GIFT",
  "ADMIN_GRANT",
]);

export const entitlementResourceTypeEnum = pgEnum("entitlement_resource_type", [
  "PLAN",
  "COURSE",
  "BUNDLE",
]);

export const entitlements = pgTable("entitlements", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  resourceType: entitlementResourceTypeEnum("resource_type").notNull(),
  // resourceId es el planId, courseId, o bundleId según resourceType
  resourceId: text("resource_id").notNull(),
  source: entitlementSourceEnum("source").notNull(),
  // referenceId apunta al subscription.id o payment.id que originó el entitlement
  referenceId: text("reference_id"),
  validFrom: timestamp("valid_from", { withTimezone: true }).notNull().defaultNow(),
  validUntil: timestamp("valid_until", { withTimezone: true }), // null = indefinido (lifetime)
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  revokedReason: text("revoked_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
