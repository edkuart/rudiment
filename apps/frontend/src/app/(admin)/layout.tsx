import { redirect } from "next/navigation";
import Link from "next/link";

// Simple admin layout — auth guard done server-side via cookie check (full implementation in Phase 10)
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/courses", label: "Courses" },
  ] as const;

  return (
    <div className="flex min-h-screen bg-[var(--surface-0)]">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-[var(--surface-2)] bg-[var(--surface-1)] lg:flex">
        <div className="flex h-16 items-center px-6">
          <span className="text-lg font-bold tracking-tight text-[var(--brand)]">Rudiment</span>
          <span className="ml-2 rounded bg-[var(--brand)]/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--brand)]">
            Admin
          </span>
        </div>

        <nav className="flex flex-col gap-0.5 px-3 py-2">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-2 text-sm font-medium text-[var(--text-2)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-1)]"
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-[var(--surface-2)] bg-[var(--surface-1)] px-6 lg:hidden">
          <span className="font-bold text-[var(--brand)]">Rudiment Admin</span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
