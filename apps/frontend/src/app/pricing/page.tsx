"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchApiData } from "@/lib/api-fetch";

type Plan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  intervalDays: number | null;
};

const fallbackPlans: Plan[] = [
  {
    id: "monthly-preview",
    name: "Monthly Membership",
    slug: "monthly",
    description: "Full academy access billed every month.",
    price: 2900,
    currency: "usd",
    intervalDays: 30,
  },
  {
    id: "annual-preview",
    name: "Annual Membership",
    slug: "annual",
    description: "The strongest value for committed drummers.",
    price: 29000,
    currency: "usd",
    intervalDays: 365,
  },
  {
    id: "lifetime-preview",
    name: "Lifetime Access",
    slug: "lifetime",
    description: "One payment for permanent premium access.",
    price: 19900,
    currency: "usd",
    intervalDays: null,
  },
];

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(price / 100);
}

function cadence(plan: Plan) {
  if (plan.intervalDays === null) return "one-time";
  if (plan.intervalDays >= 365) return "per year";
  return "per month";
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>(fallbackPlans);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApiData<Plan[]>("/billing/plans", { auth: "none" })
      .then((data) => {
        if (data.length > 0) {
          setPlans(data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen px-5 py-14 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm uppercase text-[var(--color-gold-400)]">
            Membership
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-6xl uppercase text-white sm:text-7xl">
            Choose the pace. Keep the standard high.
          </h1>
          <p className="mt-5 text-base leading-7 text-[var(--text-2)]">
            Billing is already wired into the platform. Pick a plan, create your
            account, and move straight into the library.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className="rounded-[1.75rem] border border-white/8 bg-[var(--color-surface-1)] p-6"
            >
              <p className="text-xs uppercase text-[var(--text-3)]">{plan.slug}</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl uppercase text-white">
                {plan.name}
              </h2>
              <p className="mt-5 font-[family-name:var(--font-display)] text-6xl uppercase text-[var(--color-gold-400)]">
                {formatPrice(plan.price, plan.currency)}
              </p>
              <p className="mt-1 text-sm uppercase text-[var(--text-3)]">
                {cadence(plan)}
              </p>
              <p className="mt-5 min-h-16 text-sm leading-7 text-[var(--text-2)]">
                {plan.description ?? "Premium access to the full Rudiment academy."}
              </p>
              <Link
                href="/register"
                className="mt-8 inline-flex rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Start with {plan.slug}
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-[var(--text-2)]">
          <span>{loading ? "Checking live billing plans..." : "Billing plans loaded."}</span>
          <Link href="/login" className="text-[var(--color-gold-400)] hover:underline">
            Already a member?
          </Link>
        </div>
      </div>
    </main>
  );
}
