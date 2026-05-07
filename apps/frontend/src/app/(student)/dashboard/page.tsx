"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { fetchApiData } from "@/lib/api-fetch";

interface StudentStats {
  enrolledCourses: number;
  completedLessons: number;
  completedCourses: number;
  bookmarks: number;
}

interface ContinueItem {
  courseId: string;
  percentComplete: number;
  lastActivityAt: string;
}

interface Bookmark {
  id: string;
  resourceType: string;
  resourceId: string;
  createdAt: string;
}

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    return await fetchApiData<T>(path, { auth: "required" });
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [continueWatching, setContinueWatching] = useState<ContinueItem[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<StudentStats>("/progress/stats"),
      apiFetch<ContinueItem[]>("/progress/continue-watching?limit=6"),
      apiFetch<Bookmark[]>("/progress/bookmarks?type=course"),
    ]).then(([s, cw, bm]) => {
      if (s) setStats(s);
      if (cw) setContinueWatching(cw);
      if (bm) setBookmarks(bm);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 space-y-8">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--surface-1)]" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-[var(--surface-1)]" />
          ))}
        </div>
        <div className="h-48 animate-pulse rounded-xl bg-[var(--surface-1)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 space-y-10">
      <h1 className="text-3xl font-bold text-[var(--text-1)]">My Dashboard</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Courses Enrolled" value={stats.enrolledCourses} icon="📚" />
          <StatCard label="Lessons Completed" value={stats.completedLessons} icon="✅" />
          <StatCard label="Courses Completed" value={stats.completedCourses} icon="🏆" />
          <StatCard label="Bookmarks" value={stats.bookmarks} icon="🔖" />
        </div>
      )}

      {/* Continue Watching */}
      {continueWatching.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--text-1)]">Continue Watching</h2>
            <Link href="/library" className="text-xs text-[var(--brand)] hover:underline">
              Browse all →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {continueWatching.map((item) => (
              <ContinueCard key={item.courseId} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Bookmarks */}
      {bookmarks.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-[var(--text-1)]">Bookmarked Courses</h2>
          <div className="space-y-2">
            {bookmarks.map((bm) => (
              <div
                key={bm.id}
                className="flex items-center justify-between rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🔖</span>
                  <span className="text-sm capitalize text-[var(--text-2)]">
                    {bm.resourceType} · {bm.resourceId.slice(0, 8)}…
                  </span>
                </div>
                <Link
                  href="/library"
                  className="text-xs text-[var(--brand)] hover:underline"
                >
                  View →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {!stats && continueWatching.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <span className="text-6xl">🥁</span>
          <p className="text-lg font-medium text-[var(--text-1)]">Your journey starts here</p>
          <p className="text-sm text-[var(--text-2)]">Browse the library and start your first course.</p>
          <Link
            href="/library"
            className="rounded-xl bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Explore Courses
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)] p-5">
      <span className="text-2xl">{icon}</span>
      <span className="text-3xl font-bold text-[var(--text-1)]">{value}</span>
      <span className="text-xs text-[var(--text-3)]">{label}</span>
    </div>
  );
}

function ContinueCard({ item }: { item: ContinueItem }) {
  return (
    <div className="rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-3)]">
          {new Date(item.lastActivityAt).toLocaleDateString()}
        </span>
        <span className="text-xs font-semibold text-[var(--brand)]">{item.percentComplete}%</span>
      </div>
      <ProgressBar percent={item.percentComplete} size="md" />
      <Link
        href="/library"
        className="block text-center rounded-lg bg-[var(--brand)]/10 px-3 py-1.5 text-xs font-medium text-[var(--brand)] hover:bg-[var(--brand)]/20 transition-colors"
      >
        Resume →
      </Link>
    </div>
  );
}
