import { stripe } from "./stripe.client.js";
import { eventBus } from "../../shared/events/event-bus.js";
import { logger } from "../../shared/utils/logger.js";
import { AppError, NotFoundError } from "../../shared/middleware/error-handler.js";
import { env } from "../../shared/config/env.js";
import type { BillingRepository } from "./billing.repository.js";
import type {
  CreateCheckoutInput,
  CheckoutSession,
  SubscriptionSummary,
} from "./billing.types.js";
import Stripe from "stripe";

// Stripe v17 (dahlia) cambió la estructura de tipos. Los objetos de evento
// webhook tienen campos que difieren de los objetos recuperados vía API.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StripeWebhookObject = Record<string, any>;
type StripeEvent = Awaited<ReturnType<typeof stripe.events.retrieve>>;
type StripeCheckoutSessionCreateParams = Parameters<typeof stripe.checkout.sessions.create>[0];

export class BillingService {
  constructor(private readonly repo: BillingRepository) {}

  // ─── Planes ──────────────────────────────────────────────────────────────

  async getActivePlans() {
    return this.repo.findAllActivePlans();
  }

  // ─── Checkout ────────────────────────────────────────────────────────────

  async createCheckoutSession(input: CreateCheckoutInput): Promise<CheckoutSession> {
    const plan = await this.repo.findPlanById(input.planId);
    if (!plan) throw new NotFoundError("Plan");
    if (!plan.stripePriceId) {
      throw new AppError(400, "PLAN_NOT_AVAILABLE", "This plan is not available for purchase");
    }

    // Reusar stripe customer si ya existe
    const existingCustomerId = await this.repo.findStripeCustomerId(input.userId);

    const sessionParams: StripeCheckoutSessionCreateParams = {
      mode: plan.intervalDays === null ? "payment" : "subscription",
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: {
        userId: input.userId,
        planId: input.planId,
      },
      ...(existingCustomerId
        ? { customer: existingCustomerId }
        : { customer_creation: "always" }),
    };

    // Trial solo para planes de suscripción
    if (plan.intervalDays !== null && plan.trialDays && plan.trialDays > 0) {
      sessionParams.subscription_data = {
        trial_period_days: plan.trialDays,
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    logger.info({ userId: input.userId, planId: input.planId }, "Checkout session created");

    return { url: session.url!, sessionId: session.id };
  }

  // ─── Portal de billing (gestionar suscripción) ───────────────────────────

  async createPortalSession(userId: string): Promise<{ url: string }> {
    const customerId = await this.repo.findStripeCustomerId(userId);
    if (!customerId) {
      throw new AppError(404, "NO_SUBSCRIPTION", "No billing account found");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${env.WEB_URL}/settings/billing`,
    });

    return { url: session.url };
  }

  // ─── Suscripción del usuario ─────────────────────────────────────────────

  async getUserSubscription(userId: string): Promise<SubscriptionSummary | null> {
    const sub = await this.repo.findActiveSubscription(userId);
    if (!sub) return null;

    return {
      id: sub.id,
      status: sub.status as SubscriptionSummary["status"],
      plan: {
        id: sub.plan.id,
        name: sub.plan.name,
        slug: sub.plan.slug,
        price: sub.plan.price,
        currency: sub.plan.currency,
        intervalDays: sub.plan.intervalDays,
      },
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    };
  }

  async getPaymentHistory(userId: string) {
    return this.repo.findPaymentsByUserId(userId);
  }

  // ─── Webhook handler ─────────────────────────────────────────────────────

  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    if (!env.STRIPE_WEBHOOK_SECRET) {
      throw new AppError(500, "CONFIG_ERROR", "Webhook secret not configured");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let event: any;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET) as unknown;
    } catch {
      throw new AppError(400, "INVALID_WEBHOOK", "Webhook signature verification failed");
    }

    logger.info({ eventType: event.type, eventId: event.id }, "Stripe webhook received");

    // Idempotency: skip events already processed (Stripe retries on non-2xx).
    const alreadyProcessed = await this.repo.isWebhookEventProcessed(event.id);
    if (alreadyProcessed) {
      logger.debug({ eventId: event.id }, "Duplicate webhook event — skipping");
      return;
    }

    switch (event.type) {
      case "checkout.session.completed":
        await this.onCheckoutCompleted(event.data.object);
        break;
      case "customer.subscription.updated":
        await this.onSubscriptionUpdated(event.data.object);
        break;
      case "customer.subscription.deleted":
        await this.onSubscriptionDeleted(event.data.object);
        break;
      case "invoice.payment_succeeded":
        await this.onInvoicePaymentSucceeded(event.data.object);
        break;
      case "invoice.payment_failed":
        await this.onInvoicePaymentFailed(event.data.object);
        break;
      default:
        logger.debug({ eventType: event.type }, "Unhandled Stripe event");
    }

    // Record after successful processing to guarantee at-least-once semantics.
    await this.repo.markWebhookEventProcessed(event.id, event.type);
  }

  // ─── Webhook handlers internos ───────────────────────────────────────────

  private async onCheckoutCompleted(session: StripeWebhookObject): Promise<void> {
    const userId = session.metadata?.["userId"];
    const planId = session.metadata?.["planId"];

    if (!userId || !planId) {
      logger.error({ sessionId: session.id }, "Missing metadata in checkout session");
      return;
    }

    const plan = await this.repo.findPlanById(planId);
    if (!plan) {
      logger.error({ planId }, "Plan not found for completed checkout");
      return;
    }

    // Lifetime (one-time payment)
    if (session.mode === "payment") {
      const sub = await this.repo.createSubscription({
        userId,
        planId,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: null, // lifetime = no expiry
        stripeCustomerId: session.customer as string | undefined,
      });

      await this.repo.createPayment({
        userId,
        subscriptionId: sub.id,
        amount: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
        status: "succeeded",
        stripePaymentIntentId: session.payment_intent as string | undefined,
        paidAt: new Date(),
      });

      eventBus.emit("billing.subscription.activated", {
        userId,
        planId,
        subscriptionId: sub.id,
      });

      logger.info({ userId, planId }, "Lifetime access granted");
      return;
    }

    // Suscripción recurrente — la suscripción de Stripe ya fue creada
    if (session.mode === "subscription" && session.subscription) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string) as any;

      const periodEnd = stripeSub.current_period_end
        ? new Date((stripeSub.current_period_end as number) * 1000)
        : null;

      const sub = await this.repo.createSubscription({
        userId,
        planId,
        status: stripeSub.status === "trialing" ? "TRIALING" : "ACTIVE",
        currentPeriodStart: new Date((stripeSub.current_period_start as number) * 1000),
        currentPeriodEnd: periodEnd,
        stripeSubscriptionId: stripeSub.id,
        stripeCustomerId: stripeSub.customer as string,
        trialStart: stripeSub.trial_start
          ? new Date(stripeSub.trial_start * 1000)
          : undefined,
        trialEnd: stripeSub.trial_end
          ? new Date(stripeSub.trial_end * 1000)
          : undefined,
      });

      eventBus.emit("billing.subscription.activated", {
        userId,
        planId,
        subscriptionId: sub.id,
      });

      logger.info({ userId, planId, stripeSubId: stripeSub.id }, "Subscription activated");
    }
  }

  private async onSubscriptionUpdated(stripeSub: StripeWebhookObject): Promise<void> {
    const periodEnd = stripeSub.current_period_end
      ? new Date(stripeSub.current_period_end * 1000)
      : null;

    await this.repo.updateSubscription(stripeSub.id, {
      status: this.mapStripeStatus(stripeSub.status),
      currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    });

    logger.info({ stripeSubId: stripeSub.id, status: stripeSub.status }, "Subscription updated");
  }

  private async onSubscriptionDeleted(stripeSub: StripeWebhookObject): Promise<void> {
    const sub = await this.repo.findSubscriptionByStripeId(stripeSub.id);
    if (!sub) return;

    await this.repo.updateSubscription(stripeSub.id, {
      status: "CANCELLED",
      cancelledAt: new Date(),
    });

    eventBus.emit("billing.subscription.cancelled", {
      userId: sub.userId,
      subscriptionId: sub.id,
    });

    logger.info({ stripeSubId: stripeSub.id }, "Subscription cancelled");
  }

  private async onInvoicePaymentSucceeded(invoice: StripeWebhookObject): Promise<void> {
    if (!invoice.subscription) return;

    const sub = await this.repo.findSubscriptionByStripeId(
      invoice.subscription as string,
    );
    if (!sub) return;

    await this.repo.createPayment({
      userId: sub.userId,
      subscriptionId: sub.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: "succeeded",
      stripeInvoiceId: invoice.id,
      stripePaymentIntentId: invoice.payment_intent as string | undefined,
      paidAt: new Date(),
    });

    // Renovación — actualizar período
    if (invoice.lines.data[0]?.period) {
      await this.repo.updateSubscription(invoice.subscription as string, {
        status: "ACTIVE",
        currentPeriodStart: new Date(invoice.lines.data[0].period.start * 1000),
        currentPeriodEnd: new Date(invoice.lines.data[0].period.end * 1000),
      });
    }
  }

  private async onInvoicePaymentFailed(invoice: StripeWebhookObject): Promise<void> {
    if (!invoice.subscription) return;

    const sub = await this.repo.findSubscriptionByStripeId(
      invoice.subscription as string,
    );
    if (!sub) return;

    await this.repo.updateSubscription(invoice.subscription as string, {
      status: "PAST_DUE",
    });

    await this.repo.createPayment({
      userId: sub.userId,
      subscriptionId: sub.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: "failed",
      stripeInvoiceId: invoice.id,
      failedAt: new Date(),
      failureMessage: invoice.last_finalization_error?.message,
    });

    eventBus.emit("billing.subscription.past_due", {
      userId: sub.userId,
      subscriptionId: sub.id,
    });

    logger.warn({ stripeSubId: invoice.subscription, userId: sub.userId }, "Payment failed");
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private mapStripeStatus(
    stripeStatus: string,
  ): "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELLED" | "PAUSED" {
    const map: Record<string, "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELLED" | "PAUSED"> = {
      active: "ACTIVE",
      trialing: "TRIALING",
      past_due: "PAST_DUE",
      canceled: "CANCELLED",
      unpaid: "PAST_DUE",
      paused: "PAUSED",
    };
    return map[stripeStatus] ?? "PAST_DUE";
  }
}
