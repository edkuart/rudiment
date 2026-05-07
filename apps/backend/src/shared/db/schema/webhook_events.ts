import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Tracks processed Stripe webhook events to guarantee idempotency.
// Stripe retries events on non-2xx responses — this prevents duplicate processing.
export const webhookEvents = pgTable("webhook_events", {
  id: text("id").primaryKey(), // Stripe event ID (evt_xxx)
  type: text("type").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }).notNull().defaultNow(),
});
