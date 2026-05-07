"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchApiData } from "@/lib/api-fetch";

type Subscription = {
  id: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  plan: {
    id: string;
    name: string;
    slug: string;
    price: number;
    currency: string;
    intervalDays: number | null;
  };
};

type Payment = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
};

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export default function BillingSettingsPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingPortal, setOpeningPortal] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchApiData<Subscription | null>("/billing/subscription", { auth: "required" }).catch(() => null),
      fetchApiData<Payment[]>("/billing/payments", { auth: "required" }).catch(() => []),
    ])
      .then(([sub, history]) => {
        setSubscription(sub);
        setPayments(history);
      })
      .finally(() => setLoading(false));
  }, []);

  const openPortal = async () => {
    setOpeningPortal(true);
    try {
      const result = await fetchApiData<{ url: string }>("/billing/portal", {
        method: "POST",
        auth: "required",
      });
      window.location.href = result.url;
    } catch {
      toast.error("Unable to open the billing portal");
      setOpeningPortal(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="h-8 w-56 animate-pulse rounded bg-[var(--color-surface-1)]" />
        <div className="mt-6 h-48 animate-pulse rounded-[1.5rem] bg-[var(--color-surface-1)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-sm uppercase text-[var(--color-gold-400)]">
            Billing
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl uppercase text-white">
            Membership status
          </h1>
        </div>
        {subscription ? (
          <button
            onClick={() => void openPortal()}
            disabled={openingPortal}
            className="rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {openingPortal ? "Opening..." : "Manage Billing"}
          </button>
        ) : (
          <Link
            href="/pricing"
            className="rounded-full border border-white/12 px-5 py-3 text-sm font-semibold text-[var(--text-1)] transition-colors hover:bg-white/4"
          >
            Choose a Plan
          </Link>
        )}
      </div>

      <section className="mt-8 rounded-[1.75rem] border border-white/8 bg-[var(--color-surface-1)] p-6">
        {subscription ? (
          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase text-[var(--text-3)]">Plan</p>
              <p className="mt-2 text-xl font-semibold text-white">{subscription.plan.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-[var(--text-3)]">Status</p>
              <p className="mt-2 text-xl font-semibold text-white">{subscription.status}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-[var(--text-3)]">Next renewal</p>
              <p className="mt-2 text-xl font-semibold text-white">
                {subscription.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                  : "Lifetime"}
              </p>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-lg font-semibold text-white">No active membership yet.</p>
            <p className="mt-2 text-sm leading-7 text-[var(--text-2)]">
              The billing backend is ready. Once you seed plans and connect
              Stripe price IDs, this page becomes the control center for every
              student subscription.
            </p>
          </div>
        )}
      </section>

      <section className="mt-8 rounded-[1.75rem] border border-white/8 bg-[var(--color-surface-1)] p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-3xl uppercase text-white">
            Payment history
          </h2>
          <span className="text-xs uppercase text-[var(--text-3)]">
            {payments.length} records
          </span>
        </div>

        {payments.length === 0 ? (
          <p className="text-sm text-[var(--text-2)]">
            No payment records yet.
          </p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/3 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {formatMoney(payment.amount, payment.currency)}
                  </p>
                  <p className="text-xs uppercase text-[var(--text-3)]">
                    {payment.status}
                  </p>
                </div>
                <p className="text-sm text-[var(--text-2)]">
                  {new Date(payment.paidAt ?? payment.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
