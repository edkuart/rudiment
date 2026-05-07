import { describe, it, expect, vi, beforeEach } from "vitest";
import { BillingService } from "../billing.service.js";
import type { BillingRepository } from "../billing.repository.js";

// ─── Mock de Stripe ──────────────────────────────────────────────────────────
vi.mock("../stripe.client.js", () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({ url: "https://checkout.stripe.com/test", id: "cs_test_123" }),
      },
    },
    billingPortal: {
      sessions: { create: vi.fn().mockResolvedValue({ url: "https://billing.stripe.com/test" }) },
    },
    subscriptions: {
      retrieve: vi.fn().mockResolvedValue({
        id: "sub_test",
        status: "active",
        current_period_start: 1700000000,
        current_period_end: 1702592000,
        customer: "cus_test",
        trial_start: null,
        trial_end: null,
        cancel_at_period_end: false,
      }),
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}));

function makeRepo(overrides: Partial<BillingRepository> = {}): BillingRepository {
  return {
    findAllActivePlans: vi.fn().mockResolvedValue([]),
    findPlanById: vi.fn().mockResolvedValue({
      id: "plan_monthly",
      name: "Monthly",
      slug: "monthly",
      stripePriceId: "price_test_123",
      intervalDays: 30,
      trialDays: 0,
      price: 2900,
      currency: "usd",
      isActive: true,
    }),
    findPlanByStripePriceId: vi.fn().mockResolvedValue(null),
    findActiveSubscription: vi.fn().mockResolvedValue(null),
    findSubscriptionByStripeId: vi.fn().mockResolvedValue(null),
    findSubscriptionsByUserId: vi.fn().mockResolvedValue([]),
    createSubscription: vi.fn().mockResolvedValue({ id: "sub_db_1", userId: "user_1" }),
    updateSubscription: vi.fn().mockResolvedValue(undefined),
    createPayment: vi.fn().mockResolvedValue({ id: "pay_1" }),
    findPaymentsByUserId: vi.fn().mockResolvedValue([]),
    findStripeCustomerId: vi.fn().mockResolvedValue(null),
    ...overrides,
  } as unknown as BillingRepository;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("BillingService.getActivePlans", () => {
  it("returns plans from repository", async () => {
    const plans = [{ id: "plan_1", name: "Monthly" }];
    const service = new BillingService(makeRepo({ findAllActivePlans: vi.fn().mockResolvedValue(plans) }));
    const result = await service.getActivePlans();
    expect(result).toEqual(plans);
  });
});

describe("BillingService.createCheckoutSession", () => {
  it("throws NOT_FOUND if plan does not exist", async () => {
    const service = new BillingService(makeRepo({ findPlanById: vi.fn().mockResolvedValue(null) }));
    await expect(
      service.createCheckoutSession({
        userId: "u1",
        planId: "nonexistent",
        successUrl: "https://x.com/success",
        cancelUrl: "https://x.com/cancel",
      }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("throws PLAN_NOT_AVAILABLE if no stripePriceId", async () => {
    const service = new BillingService(
      makeRepo({
        findPlanById: vi.fn().mockResolvedValue({ id: "p1", stripePriceId: null, intervalDays: 30, trialDays: 0 }),
      }),
    );
    await expect(
      service.createCheckoutSession({
        userId: "u1",
        planId: "p1",
        successUrl: "https://x.com/success",
        cancelUrl: "https://x.com/cancel",
      }),
    ).rejects.toMatchObject({ code: "PLAN_NOT_AVAILABLE" });
  });

  it("returns checkout URL for valid plan", async () => {
    const service = new BillingService(makeRepo());
    const result = await service.createCheckoutSession({
      userId: "u1",
      planId: "plan_monthly",
      successUrl: "https://x.com/success",
      cancelUrl: "https://x.com/cancel",
    });
    expect(result.url).toContain("stripe.com");
    expect(result.sessionId).toBe("cs_test_123");
  });
});

describe("BillingService.getUserSubscription", () => {
  it("returns null when no active subscription", async () => {
    const service = new BillingService(makeRepo());
    const result = await service.getUserSubscription("user_no_sub");
    expect(result).toBeNull();
  });

  it("returns subscription summary when active", async () => {
    const service = new BillingService(
      makeRepo({
        findActiveSubscription: vi.fn().mockResolvedValue({
          id: "sub_1",
          status: "ACTIVE",
          cancelAtPeriodEnd: false,
          currentPeriodEnd: new Date("2025-12-31"),
          plan: { id: "p1", name: "Monthly", slug: "monthly", price: 2900, currency: "usd", intervalDays: 30 },
        }),
      }),
    );
    const result = await service.getUserSubscription("user_1");
    expect(result?.status).toBe("ACTIVE");
    expect(result?.plan.slug).toBe("monthly");
  });
});

describe("BillingService.handleWebhook", () => {
  it("throws CONFIG_ERROR when webhook secret is not configured", async () => {
    const service = new BillingService(makeRepo());
    await expect(
      service.handleWebhook(Buffer.from("body"), "any_signature"),
    ).rejects.toMatchObject({ code: "CONFIG_ERROR", statusCode: 500 });
  });
});
