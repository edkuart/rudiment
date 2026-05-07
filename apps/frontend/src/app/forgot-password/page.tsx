import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16 sm:px-8">
      <div className="w-full max-w-xl rounded-[1.75rem] border border-white/8 bg-[var(--color-surface-1)] p-8 text-center">
        <p className="text-sm uppercase text-[var(--color-gold-400)]">
          Support route
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl uppercase text-white">
          Password reset placeholder
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--text-2)]">
          This screen is intentionally simple for now. The route exists, the
          build stays clean, and the next step is wiring the actual reset flow.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}
