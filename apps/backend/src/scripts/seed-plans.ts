import "dotenv/config";
import { eq } from "drizzle-orm";
import { db, pool } from "../shared/db/index.js";
import { env } from "../shared/config/env.js";
import { plans } from "../shared/db/schema/index.js";

const planSeeds = [
  {
    slug: "monthly" as const,
    name: "Monthly Membership",
    description: "Full academy access billed every month.",
    price: 2900,
    currency: "usd",
    intervalDays: 30,
    stripePriceId: env.STRIPE_MONTHLY_PRICE_ID ?? null,
  },
  {
    slug: "annual" as const,
    name: "Annual Membership",
    description: "Full academy access with the best yearly rate.",
    price: 29000,
    currency: "usd",
    intervalDays: 365,
    stripePriceId: env.STRIPE_ANNUAL_PRICE_ID ?? null,
  },
  {
    slug: "lifetime" as const,
    name: "Lifetime Access",
    description: "One payment for permanent access to premium content.",
    price: 19900,
    currency: "usd",
    intervalDays: null,
    stripePriceId: env.STRIPE_LIFETIME_PRICE_ID ?? null,
  },
];

async function main() {
  for (const plan of planSeeds) {
    const existing = await db.query.plans.findFirst({
      where: eq(plans.slug, plan.slug),
    });

    if (existing) {
      await db
        .update(plans)
        .set({
          name: plan.name,
          description: plan.description,
          price: plan.price,
          currency: plan.currency,
          intervalDays: plan.intervalDays,
          stripePriceId: plan.stripePriceId,
          isActive: Boolean(plan.stripePriceId),
          updatedAt: new Date(),
        })
        .where(eq(plans.id, existing.id));
      continue;
    }

    await db.insert(plans).values({
      ...plan,
      isActive: Boolean(plan.stripePriceId),
    });
  }

  console.log("Billing plans seeded");
}

main()
  .catch((error) => {
    console.error("Failed to seed billing plans", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
