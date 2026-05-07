import type { plans, subscriptions, payments } from "../../shared/db/schema/index.js";

export type Plan = typeof plans.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Payment = typeof payments.$inferSelect;

export type SubscriptionStatus =
  | "ACTIVE"
  | "TRIALING"
  | "PAST_DUE"
  | "CANCELLED"
  | "PAUSED";

export interface CreateCheckoutInput {
  userId: string;
  planId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSession {
  url: string;
  sessionId: string;
}

export interface SubscriptionSummary {
  id: string;
  status: SubscriptionStatus;
  plan: {
    id: string;
    name: string;
    slug: string;
    price: number;
    currency: string;
    intervalDays: number | null;
  };
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}
