import { eq, and } from "drizzle-orm";
import type { Db } from "../../shared/db/index.js";
import { plans, subscriptions, payments } from "../../shared/db/schema/index.js";
import type { SubscriptionStatus } from "./billing.types.js";

export class BillingRepository {
  constructor(private readonly db: Db) {}

  // ─── Plans ───────────────────────────────────────────────────────────────

  async findAllActivePlans() {
    return this.db.query.plans.findMany({
      where: eq(plans.isActive, true),
    });
  }

  async findPlanById(id: string) {
    return this.db.query.plans.findFirst({ where: eq(plans.id, id) });
  }

  async findPlanByStripePriceId(stripePriceId: string) {
    return this.db.query.plans.findFirst({
      where: eq(plans.stripePriceId, stripePriceId),
    });
  }

  // ─── Subscriptions ───────────────────────────────────────────────────────

  async findActiveSubscription(userId: string) {
    return this.db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "ACTIVE"),
      ),
      with: { plan: true },
    });
  }

  async findSubscriptionByStripeId(stripeSubscriptionId: string) {
    return this.db.query.subscriptions.findFirst({
      where: eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId),
    });
  }

  async findSubscriptionsByUserId(userId: string) {
    return this.db.query.subscriptions.findMany({
      where: eq(subscriptions.userId, userId),
      with: { plan: true },
      orderBy: (s, { desc }) => [desc(s.createdAt)],
    });
  }

  async createSubscription(data: {
    userId: string;
    planId: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date | null;
    stripeSubscriptionId?: string | undefined;
    stripeCustomerId?: string | undefined;
    trialStart?: Date | undefined;
    trialEnd?: Date | undefined;
  }) {
    const [sub] = await this.db.insert(subscriptions).values(data).returning();
    if (!sub) throw new Error("Failed to create subscription");
    return sub;
  }

  async updateSubscription(
    stripeSubscriptionId: string,
    data: Partial<{
      status: SubscriptionStatus;
      currentPeriodStart: Date;
      currentPeriodEnd: Date | null;
      cancelAtPeriodEnd: boolean;
      cancelledAt: Date | null;
    }>,
  ) {
    const [updated] = await this.db
      .update(subscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
      .returning();
    return updated;
  }

  // ─── Payments ────────────────────────────────────────────────────────────

  async createPayment(data: {
    userId: string;
    subscriptionId?: string | undefined;
    amount: number;
    currency: string;
    status: string;
    stripePaymentIntentId?: string | undefined;
    stripeInvoiceId?: string | undefined;
    paidAt?: Date | undefined;
    failedAt?: Date | undefined;
    failureMessage?: string | undefined;
  }) {
    const [payment] = await this.db.insert(payments).values(data).returning();
    if (!payment) throw new Error("Failed to create payment");
    return payment;
  }

  async findPaymentsByUserId(userId: string) {
    return this.db.query.payments.findMany({
      where: eq(payments.userId, userId),
      orderBy: (p, { desc }) => [desc(p.createdAt)],
    });
  }

  // ─── Stripe customer ID ──────────────────────────────────────────────────

  async findStripeCustomerId(userId: string): Promise<string | null> {
    const sub = await this.db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, userId),
      ),
      columns: { stripeCustomerId: true },
      orderBy: (s, { desc }) => [desc(s.createdAt)],
    });
    return sub?.stripeCustomerId ?? null;
  }
}
