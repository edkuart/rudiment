"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { coursesClient } from "@/lib/api/courses-client";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { fetchApiData } from "@/lib/api-fetch";

interface LessonItem {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  position: number;
  isFreePreview: boolean;
  estimatedDuration: number | null;
}

interface Section {
  id: string;
  title: string;
  lessons: LessonItem[];
}

interface CourseDetail {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  difficulty: string;
  accessType: string;
  totalLessons: number;
  thumbnailUrl: string | null;
  tags: string[];
  sections: Section[];
}

interface CourseProgressData {
  percentComplete: number;
  completedLessons: number;
  totalLessons: number;
}

const TYPE_ICONS: Record<string, string> = {
  VIDEO: "▶",
  PDF: "📄",
  EXERCISE: "✏️",
  MASTERCLASS: "🎓",
  BREAKDOWN: "🔍",
};

function formatDuration(seconds: number | null) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CourseDetailClient({ slug }: { slug: string }) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [progress, setProgress] = useState<CourseProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    coursesClient
      .getBySlug(slug)
      .then(async (c: any) => {
        setCourse(c);
        if (c.sections?.[0]) setExpandedSection(c.sections[0].id);

        try {
          const progressData = await fetchApiData<CourseProgressData>(`/progress/courses/${c.id}`, {
            auth: "required",
          });
          setProgress(progressData);
        } catch {
          // unauthenticated — no progress shown
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-10 w-2/3 animate-pulse rounded-lg bg-[var(--surface-1)]" />
            <div className="h-4 w-full animate-pulse rounded bg-[var(--surface-1)]" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-[var(--surface-1)]" />
          </div>
          <div className="h-64 animate-pulse rounded-2xl bg-[var(--surface-1)]" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--text-3)]">
        Course not found.
      </div>
    );
  }

  const totalSections = course.sections.length;
  const allLessons = course.sections.flatMap((s) => s.lessons);
  const firstLesson = allLessons[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-3">
        {/* Left: info + curriculum */}
        <div className="lg:col-span-2 space-y-8">
          {course.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {course.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/library?tag=${encodeURIComponent(tag)}`}
                  className="rounded-full bg-[var(--brand)]/10 px-3 py-0.5 text-xs font-medium text-[var(--brand)] hover:bg-[var(--brand)]/20 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-1)]">{course.title}</h1>
            {course.subtitle && (
              <p className="mt-2 text-lg text-[var(--text-2)]">{course.subtitle}</p>
            )}
          </div>

          {progress && progress.percentComplete > 0 && (
            <div className="rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)] p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-[var(--text-2)]">Your progress</span>
                <span className="font-semibold text-[var(--text-1)]">
                  {progress.completedLessons}/{progress.totalLessons} lessons
                </span>
              </div>
              <ProgressBar percent={progress.percentComplete} showLabel size="md" />
            </div>
          )}

          {course.description && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--text-2)]">
              {course.description}
            </p>
          )}

          {totalSections > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-[var(--text-1)]">Curriculum</h2>
              <div className="space-y-3">
                {course.sections.map((section) => (
                  <div
                    key={section.id}
                    className="overflow-hidden rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)]"
                  >
                    <button
                      onClick={() =>
                        setExpandedSection(expandedSection === section.id ? null : section.id)
                      }
                      className="flex w-full items-center justify-between px-4 py-3 text-left"
                    >
                      <span className="font-medium text-[var(--text-1)]">{section.title}</span>
                      <span className="text-xs text-[var(--text-3)]">
                        {section.lessons.length} lesson{section.lessons.length === 1 ? "" : "s"}
                        {" "}
                        <span className={`ml-2 inline-block transition-transform ${expandedSection === section.id ? "rotate-180" : ""}`}>▼</span>
                      </span>
                    </button>

                    {expandedSection === section.id && (
                      <div className="border-t border-[var(--surface-2)]">
                        {section.lessons.length === 0 ? (
                          <p className="px-4 py-3 text-sm text-[var(--text-3)]">No lessons yet.</p>
                        ) : (
                          section.lessons.map((lesson) => (
                            <Link
                              key={lesson.id}
                              href={`/library/${slug}/${lesson.slug}`}
                              className="flex items-center gap-3 border-b border-[var(--surface-2)] px-4 py-3 last:border-0 hover:bg-[var(--surface-2)]/50 transition-colors"
                            >
                              <span className="text-sm">{TYPE_ICONS[lesson.type] ?? "▶"}</span>
                              <span className="flex-1 text-sm text-[var(--text-1)]">{lesson.title}</span>
                              <div className="flex items-center gap-3 text-xs text-[var(--text-3)]">
                                {lesson.isFreePreview && (
                                  <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-green-400">
                                    Free
                                  </span>
                                )}
                                {formatDuration(lesson.estimatedDuration) && (
                                  <span>{formatDuration(lesson.estimatedDuration)}</span>
                                )}
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: sticky enrollment card */}
        <div>
          <div className="sticky top-6 space-y-4 rounded-2xl border border-[var(--surface-2)] bg-[var(--surface-1)] p-6">
            {course.thumbnailUrl && (
              <div className="overflow-hidden rounded-xl aspect-video bg-[var(--surface-2)]">
                <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
              </div>
            )}

            <div className="space-y-2 text-sm text-[var(--text-2)]">
              <Row label="Difficulty" value={course.difficulty} />
              <Row label="Access" value={course.accessType} />
              <Row label="Lessons" value={String(course.totalLessons)} />
              {totalSections > 0 && <Row label="Sections" value={String(totalSections)} />}
            </div>

            {firstLesson && (
              <Link
                href={`/library/${slug}/${firstLesson.slug}`}
                className="block w-full rounded-xl bg-[var(--brand)] py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                {progress && progress.percentComplete > 0 ? "Continue Learning" : "Start Learning"}
              </Link>
            )}

            {course.accessType !== "FREE" && (
              <p className="text-center text-xs text-[var(--text-3)]">
                Included with Rudiment subscription
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--text-3)]">{label}</span>
      <span className="font-medium capitalize text-[var(--text-1)]">{value.toLowerCase()}</span>
    </div>
  );
}
