"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { coursesClient, type CourseListItem, type Tag } from "@/lib/api/courses-client";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { fetchApiData } from "@/lib/api-fetch";

const DIFFICULTY_LABELS: Record<string, string> = {
  ALL: "All Levels",
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

interface ContinueWatchingItem {
  courseId: string;
  percentComplete: number;
  lastActivityAt: string;
}

export default function LibraryPage() {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);
  const [courseProgress, setCourseProgress] = useState<Record<string, number>>({});
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [tagSlug, setTagSlug] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { status: "PUBLISHED", perPage: "50" };
      if (search) params["search"] = search;
      if (difficulty) params["difficulty"] = difficulty;
      if (tagSlug) params["tagSlug"] = tagSlug;

      const [coursesRes, continueRes] = await Promise.allSettled([
        coursesClient.list(params) as Promise<any>,
        fetchApiData<ContinueWatchingItem[]>("/progress/continue-watching?limit=10", {
          auth: "required",
        })
          .then((data) => ({ data }))
          .catch(() => ({ data: [] })),
      ]);

      const rows = coursesRes.status === "fulfilled" ? (coursesRes.value?.rows ?? []) : [];
      setCourses(rows);

      if (continueRes.status === "fulfilled") {
        const items: ContinueWatchingItem[] = continueRes.value?.data ?? [];
        setContinueWatching(items);
        const progressMap: Record<string, number> = {};
        for (const item of items) {
          progressMap[item.courseId] = item.percentComplete;
        }
        setCourseProgress(progressMap);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    coursesClient.getTags().then(setTags).catch(() => {});
  }, []);

  useEffect(() => { void load(); }, [difficulty, tagSlug]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void load();
  };

  const inProgressCourses = continueWatching
    .filter((c) => c.percentComplete > 0 && c.percentComplete < 100)
    .map((c) => courses.find((course) => course.id === c.courseId))
    .filter(Boolean) as CourseListItem[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--text-1)]">Course Library</h1>
        <p className="mt-2 text-lg text-[var(--text-2)]">
          Master the drums with world-class instruction.
        </p>
      </div>

      {/* Continue Watching */}
      {!loading && inProgressCourses.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-[var(--text-1)]">Continue Watching</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {inProgressCourses.map((course) => (
              <Link
                key={course.id}
                href={`/library/${course.slug}`}
                className="w-56 shrink-0 overflow-hidden rounded-xl border border-[var(--brand)]/30 bg-[var(--surface-1)] transition-all hover:-translate-y-0.5 hover:border-[var(--brand)]/60"
              >
                <div className="relative aspect-video w-full bg-[var(--surface-2)]">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-3xl opacity-20">🥁</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="mb-2 text-xs font-medium text-[var(--text-1)] line-clamp-2">{course.title}</p>
                  <ProgressBar percent={courseProgress[course.id] ?? 0} showLabel size="sm" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses…"
            className="flex-1 rounded-lg border border-[var(--surface-2)] bg-[var(--surface-1)] px-4 py-2 text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:border-[var(--brand)] focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-[var(--brand)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Search
          </button>
        </form>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="rounded-lg border border-[var(--surface-2)] bg-[var(--surface-1)] px-4 py-2 text-sm text-[var(--text-1)] focus:border-[var(--brand)] focus:outline-none"
        >
          <option value="">All Levels</option>
          {Object.entries(DIFFICULTY_LABELS)
            .filter(([k]) => k !== "ALL")
            .map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
        </select>
      </div>

      {/* Tag chips */}
      {tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setTagSlug("")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !tagSlug
                ? "bg-[var(--brand)] text-white"
                : "bg-[var(--surface-2)] text-[var(--text-2)] hover:bg-[var(--surface-3)]"
            }`}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag.slug}
              onClick={() => setTagSlug(tagSlug === tag.slug ? "" : tag.slug)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                tagSlug === tag.slug
                  ? "bg-[var(--brand)] text-white"
                  : "bg-[var(--surface-2)] text-[var(--text-2)] hover:bg-[var(--surface-3)]"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-[var(--surface-1)]" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-[var(--text-3)]">
          No courses found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              progress={courseProgress[course.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course, progress }: { course: CourseListItem; progress?: number | undefined }) {
  return (
    <Link
      href={`/library/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--surface-2)] bg-[var(--surface-1)] transition-all hover:-translate-y-0.5 hover:border-[var(--brand)]/40 hover:shadow-lg hover:shadow-[var(--brand)]/5"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-[var(--surface-2)]">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl opacity-20">🥁</span>
          </div>
        )}
        <div className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {DIFFICULTY_LABELS[course.difficulty] ?? course.difficulty}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-[var(--text-1)] group-hover:text-[var(--brand)]">
          {course.title}
        </h3>
        {course.subtitle && (
          <p className="mt-1 text-sm text-[var(--text-2)] line-clamp-2">{course.subtitle}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-4 text-xs text-[var(--text-3)]">
          <span>{course.totalLessons} lesson{course.totalLessons === 1 ? "" : "s"}</span>
          <span className="font-medium uppercase tracking-wide">{course.accessType}</span>
        </div>
        {progress !== undefined && progress > 0 && (
          <div className="mt-3">
            <ProgressBar percent={progress} showLabel size="sm" />
          </div>
        )}
      </div>
    </Link>
  );
}
