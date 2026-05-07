"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { coursesClient, type CourseListItem } from "@/lib/api/courses-client";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-yellow-500/10 text-yellow-400",
  PUBLISHED: "bg-green-500/10 text-green-400",
  ARCHIVED: "bg-[var(--surface-3)] text-[var(--text-3)]",
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async (q?: string) => {
    setLoading(true);
    try {
      const params: Record<string, string> = { perPage: "50" };
      if (q) params.search = q;
      const res = await coursesClient.list(params) as any;
      setCourses(res.rows ?? []);
      setTotal(res.meta?.total ?? 0);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(search || undefined);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await coursesClient.delete(id);
    toast.success("Course deleted");
    load();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-1)]">Courses</h1>
          <p className="mt-0.5 text-sm text-[var(--text-2)]">{total} total</p>
        </div>
        <Link
          href="/admin/courses/new"
          className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          + New Course
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses…"
          className="flex-1 rounded-lg border border-[var(--surface-3)] bg-[var(--surface-1)] px-4 py-2 text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:border-[var(--brand)] focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-[var(--surface-2)] px-4 py-2 text-sm font-medium text-[var(--text-1)] transition-colors hover:bg-[var(--surface-3)]"
        >
          Search
        </button>
      </form>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)]">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--brand)] border-t-transparent" />
          </div>
        ) : courses.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-[var(--text-3)]">
            No courses found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--surface-2)] text-left text-xs uppercase tracking-wider text-[var(--text-3)]">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Difficulty</th>
                <th className="px-4 py-3">Access</th>
                <th className="px-4 py-3 text-right">Lessons</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr
                  key={course.id}
                  className="border-b border-[var(--surface-2)] last:border-0 hover:bg-[var(--surface-2)]/40"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-[var(--text-1)]">{course.title}</div>
                    {course.subtitle && (
                      <div className="mt-0.5 text-xs text-[var(--text-3)]">{course.subtitle}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[course.status] ?? ""}`}
                    >
                      {course.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize text-[var(--text-2)]">
                    {course.difficulty.toLowerCase()}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-2)]">{course.accessType}</td>
                  <td className="px-4 py-3 text-right text-[var(--text-2)]">
                    {course.totalLessons}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/courses/${course.id}`}
                        className="text-xs font-medium text-[var(--brand)] hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(course.id, course.title)}
                        className="text-xs font-medium text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
