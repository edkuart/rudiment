import Link from "next/link";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--surface-0)]">
      <nav className="sticky top-0 z-40 border-b border-[var(--surface-2)] bg-[var(--surface-1)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-lg font-bold tracking-tight text-[var(--brand)]">
            🥁 Rudiment
          </Link>
          <div className="flex items-center gap-4 text-xs sm:gap-6 sm:text-sm">
            <Link href="/library" className="text-sm font-medium text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">
              Library
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">
              Dashboard
            </Link>
            <Link href="/settings/billing" className="text-sm font-medium text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">
              Billing
            </Link>
            <Link href="/settings/profile" className="text-sm font-medium text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">
              Profile
            </Link>
            <Link
              href="/admin"
              className="rounded-lg bg-[var(--brand)]/10 px-3 py-1.5 text-sm font-semibold text-[var(--brand)] hover:bg-[var(--brand)]/20 transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
