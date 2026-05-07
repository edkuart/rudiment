import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <main className="flex min-h-screen items-center px-5 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/8 bg-[var(--color-surface-1)] p-8 text-center sm:p-12">
        <p className="text-sm uppercase text-[var(--color-gold-400)]">
          Payment received
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-6xl uppercase text-white sm:text-7xl">
          You are in.
        </h1>
        <p className="mt-5 text-base leading-7 text-[var(--text-2)]">
          Your purchase was completed successfully. Head to the dashboard to
          keep training, or open billing settings if you want to verify the
          subscription details.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Open Dashboard
          </Link>
          <Link
            href="/settings/billing"
            className="rounded-full border border-white/12 px-6 py-3 text-sm font-semibold text-[var(--text-1)] transition-colors hover:bg-white/4"
          >
            Billing Settings
          </Link>
        </div>
      </div>
    </main>
  );
}
