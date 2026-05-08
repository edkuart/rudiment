"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Users, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchApiData } from "@/lib/api-fetch";

interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  role: string;
  created_at: string;
  last_seen_at: string | null;
}

interface UsersResult {
  total: number;
  page: number;
  limit: number;
  users: User[];
}

const ROLE_OPTIONS = ["ALL", "STUDENT", "INSTRUCTOR", "ADMIN"] as const;

const ROLE_COLORS: Record<string, string> = {
  STUDENT:    "bg-blue-500/10 text-blue-400",
  INSTRUCTOR: "bg-purple-500/10 text-purple-400",
  ADMIN:      "bg-[var(--brand)]/10 text-[var(--brand)]",
};

function formatDate(iso: string | null) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function timeAgo(iso: string | null) {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 30) return `${d}d ago`;
  const m = Math.floor(d / 30);
  if (m < 12) return `${m}mo ago`;
  return `${Math.floor(m / 12)}y ago`;
}

export default function AdminStudentsPage() {
  const [result, setResult] = useState<UsersResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
  }, [search]);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (role !== "ALL") params.set("role", role);
    if (debouncedSearch) params.set("search", debouncedSearch);

    fetchApiData<UsersResult>(`/analytics/users?${params}`, { auth: "required" })
      .then(setResult)
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, [page, role, debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  const totalPages = result ? Math.ceil(result.total / result.limit) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-1)]">Students</h1>
          <p className="mt-0.5 text-sm text-[var(--text-3)]">
            {result ? `${result.total.toLocaleString()} total users` : "Loading…"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full rounded-lg border border-[var(--surface-3)] bg-[var(--surface-0)] py-2 pl-8 pr-3 text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:border-[var(--brand)] focus:outline-none transition-colors"
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-[var(--surface-1)] p-1 border border-[var(--surface-2)]">
          {ROLE_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => { setRole(r); setPage(1); }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                role === r
                  ? "bg-[var(--surface-0)] text-[var(--text-1)] shadow-sm"
                  : "text-[var(--text-3)] hover:text-[var(--text-2)]"
              }`}
            >
              {r === "ALL" ? "All roles" : r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--brand)] border-t-transparent" />
        </div>
      ) : !result || result.users.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-[var(--surface-2)] text-[var(--text-3)]">
          <Users size={24} className="opacity-40" />
          <p className="text-sm">No users found</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--surface-2)]">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-3)]">User</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-3)]">Role</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-3)]">Joined</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-3)]">Last seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--surface-2)]">
                {result.users.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--surface-2)]/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover bg-[var(--surface-2)]" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand)]/15 text-[var(--brand)] text-sm font-semibold">
                            {(user.display_name?.[0] ?? user.email[0] ?? "?").toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-[var(--text-1)]">{user.display_name || "—"}</p>
                          <p className="text-xs text-[var(--text-3)]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[user.role] ?? "bg-[var(--surface-2)] text-[var(--text-2)]"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-2)]">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-2)]">
                      {timeAgo(user.last_seen_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--text-3)]">
                Showing {(page - 1) * result.limit + 1}–{Math.min(page * result.limit, result.total)} of {result.total}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded p-1.5 text-[var(--text-3)] hover:bg-[var(--surface-2)] disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`min-w-[28px] rounded px-2 py-1 text-xs font-medium transition-colors ${
                        p === page
                          ? "bg-[var(--brand)] text-white"
                          : "text-[var(--text-2)] hover:bg-[var(--surface-2)]"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded p-1.5 text-[var(--text-3)] hover:bg-[var(--surface-2)] disabled:opacity-40 transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
