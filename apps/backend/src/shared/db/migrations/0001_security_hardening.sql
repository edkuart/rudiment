-- Migration: 0001_security_hardening
-- Adds token family reuse detection, payment status enum,
-- webhook event idempotency table, and missing indexes.

-- ─── Sessions: token family ────────────────────────────────────────────────
ALTER TABLE "sessions"
  ADD COLUMN "family_id" text NOT NULL DEFAULT gen_random_uuid()::text,
  ADD COLUMN "used_at" timestamp with time zone;

CREATE INDEX "sessions_family_id_idx" ON "sessions" ("family_id");

-- ─── Payment status: migrate text → enum ──────────────────────────────────
CREATE TYPE "payment_status" AS ENUM ('pending', 'succeeded', 'failed', 'refunded');

ALTER TABLE "payments"
  ALTER COLUMN "status" TYPE "payment_status"
  USING "status"::"payment_status";

-- ─── Missing indexes ──────────────────────────────────────────────────────
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions" ("user_id");
CREATE INDEX "payments_user_id_idx" ON "payments" ("user_id");
CREATE INDEX "entitlements_user_id_idx" ON "entitlements" ("user_id");
CREATE INDEX "entitlements_user_resource_idx"
  ON "entitlements" ("user_id", "resource_type", "resource_id");

-- ─── Webhook events: idempotency table ────────────────────────────────────
CREATE TABLE "webhook_events" (
  "id" text PRIMARY KEY,          -- Stripe event ID (evt_xxx)
  "type" text NOT NULL,
  "processed_at" timestamp with time zone NOT NULL DEFAULT now()
);
