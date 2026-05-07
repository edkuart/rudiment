import Stripe from "stripe";
import { env } from "../../shared/config/env.js";
import { logger } from "../../shared/utils/logger.js";

const stripeSecretKey = env.STRIPE_SECRET_KEY;

export const stripe: InstanceType<typeof Stripe> = new Stripe(
  stripeSecretKey ?? "sk_test_placeholder_for_local_boot_only",
  { apiVersion: "2026-04-22.dahlia" },
);

if (!stripeSecretKey) {
  logger.warn(
    "Stripe disabled: STRIPE_SECRET_KEY not configured. Billing endpoints will fail until you add a real key.",
  );
}
