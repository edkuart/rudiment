"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut, Drum } from "lucide-react";
import { adminNav, type NavItem } from "@/lib/admin-nav";
import { useAuth } from "@/lib/auth/use-auth";

function isActive(pathname: string, href: string, exact = false) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

function NavLink({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname();
  const active = isActive(pathname, item.href, item.exact);
  const hasChildren = item.children && item.children.length > 0;
  const anyChildActive = item.children?.some((c) => isActive(pathname, c.href, c.exact));
  const [open, setOpen] = useState(anyChildActive ?? active);

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            anyChildActive
              ? "bg-[var(--brand)]/10 text-[var(--brand)]"
              : "text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)]"
          }`}
        >
          {item.icon && <item.icon size={16} className="shrink-0" />}
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown
            size={14}
            className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <div className="mt-0.5 ml-3 space-y-0.5 border-l border-[var(--surface-2)] pl-3">
            {item.children!.map((child) => (
              <NavLink key={child.href} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href as any}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-[var(--brand)]/10 text-[var(--brand)]"
          : "text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)]"
      }`}
    >
      {item.icon && <item.icon size={16} className="shrink-0" />}
      <span>{item.label}</span>
    </Link>
  );
}

export function AdminSidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-[var(--surface-2)] bg-[var(--surface-1)]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-4 border-b border-[var(--surface-2)]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand)]/10">
          <Drum size={16} className="text-[var(--brand)]" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight text-[var(--text-1)]">Rudiment</p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--brand)]">
            Admin
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {adminNav.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-3)]">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-[var(--surface-2)] px-3 py-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand)]/10 text-xs font-bold text-[var(--brand)]">
            {(user?.displayName?.[0] ?? user?.email?.[0] ?? "A").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-[var(--text-1)]">
              {user?.displayName ?? "Admin"}
            </p>
            <p className="truncate text-[10px] text-[var(--text-3)]">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="shrink-0 rounded p-1 text-[var(--text-3)] hover:text-red-400 transition-colors"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
