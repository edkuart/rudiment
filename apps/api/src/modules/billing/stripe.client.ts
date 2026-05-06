import Stripe from "stripe";
import { env } from "../../shared/config/env.js";

if (!env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

export const stripe: InstanceType<typeof Stripe> = new Stripe(
  env.STRIPE_SECRET_KEY,
  { apiVersion: "2026-04-22.dahlia" },
);
