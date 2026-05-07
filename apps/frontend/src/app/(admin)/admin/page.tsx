"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApiData } from "@/lib/api-fetch";

interface Overview {
  totalUsers: number;
  newUsers30d: number;
  activeSubscriptions: number;
  mrrCents: number;
  totalCourses: number;
  totalLessons: number;
}

interface TopCourse {
  courseId: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  learners: number;
  completions: number;
}

interface RecentSignup {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
}

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    return await fetchApiData<T>(path, { auth: "required" });
  } catch {
    return null;
  }
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [recentSignups, setRecentSignups] = useState<RecentSignup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<Overview>("/analytics/overview"),
      apiFetch<TopCourse[]>("/analytics/top-courses"),
      apiFetch<RecentSignup[]>("/analytics/recent-signups"),
    ]).then(([ov, tc, rs]) => {
      if (ov) setOverview(ov);
      if (tc) setTopCourses(tc);
      if (rs) setRecentSignups(rs);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-[var(--surface-2)]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-1)]">Dashboard</h1>
        <span className="text-xs text-[var(--text-3)]">
          {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </span>
      </div>

      {/* KPI Cards */}
      {overview && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <KpiCard label="Total Users" value={overview.totalUsers.toLocaleString()} icon="👥" />
          <KpiCard label="New (30d)" value={`+${overview.newUsers30d}`} icon="📈" accent />
          <KpiCard label="Active Subs" value={overview.activeSubscriptions.toLocaleString()} icon="💳" />
          <KpiCard label="MRR" value={formatCurrency(overview.mrrCents)} icon="💰" />
          <KpiCard label="Courses" value={overview.totalCourses.toLocaleString()} icon="📚" />
          <KpiCard label="Lessons" value={overview.totalLessons.toLocaleString()} icon="🎬" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Courses */}
        {topCourses.length > 0 && (
          <div className="rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)]">
            <div className="border-b border-[var(--surface-2)] px-5 py-4">
              <h2 className="text-sm font-semibold text-[var(--text-1)]">Top Courses by Learners</h2>
            </div>
            <div className="divide-y divide-[var(--surface-2)]">
              {topCourses.map((course, idx) => (
                <div key={course.courseId} className="flex items-center gap-4 px-5 py-3">
                  <span className="w-5 text-center text-sm font-bold text-[var(--text-3)]">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--text-1)]">{course.title}</p>
                    <p className="text-xs text-[var(--text-3)]">
                      {course.learners} learners · {course.completions} completions
                    </p>
                  </div>
                  <Link
                    href={`/admin/courses/${course.courseId}`}
                    className="shrink-0 text-xs text-[var(--brand)] hover:underline"
                  >
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Signups */}
        {recentSignups.length > 0 && (
          <div className="rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)]">
            <div className="border-b border-[var(--surface-2)] px-5 py-4">
              <h2 className="text-sm font-semibold text-[var(--text-1)]">Recent Signups</h2>
            </div>
            <div className="divide-y divide-[var(--surface-2)]">
              {recentSignups.map((user) => (
                <div key={user.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand)]/10 text-xs font-bold text-[var(--brand)]">
                    {(user.display_name?.[0] ?? user.email[0] ?? "?").toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--text-1)]">
                      {user.display_name || "—"}
                    </p>
                    <p className="truncate text-xs text-[var(--text-3)]">{user.email}</p>
                  </div>
                  <span className="shrink-0 text-xs text-[var(--text-3)]">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: string;
  accent?: boolean | undefined;
}) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border p-5 ${
        accent
          ? "border-[var(--brand)]/30 bg-[var(--brand)]/5"
          : "border-[var(--surface-2)] bg-[var(--surface-1)]"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className={`text-2xl font-bold ${accent ? "text-[var(--brand)]" : "text-[var(--text-1)]"}`}>
        {value}
      </span>
      <span className="text-xs text-[var(--text-3)]">{label}</span>
    </div>
  );
}
