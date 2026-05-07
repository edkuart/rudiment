"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { fetchApiJson } from "@/lib/api-fetch";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  type: string;
  isFreePreview: boolean;
  estimatedDuration: number | null;
  videoAsset?: { status: string; muxPlaybackId: string | null } | null;
}

interface Section {
  id: string;
  title: string;
  lessons: Array<{
    id: string;
    title: string;
    slug: string;
    type: string;
    status: string;
    position: number;
    isFreePreview: boolean;
    estimatedDuration: number | null;
  }>;
}

interface CourseWithCurriculum {
  id: string;
  title: string;
  slug: string;
  sections: Section[];
}

function formatDuration(s: number | null) {
  if (!s) return null;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const TYPE_ICONS: Record<string, string> = {
  VIDEO: "▶",
  PDF: "📄",
  EXERCISE: "✏️",
  MASTERCLASS: "🎓",
  BREAKDOWN: "🔍",
};

export default function LessonPage() {
  const { slug, lessonSlug } = useParams<{ slug: string; lessonSlug: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<CourseWithCurriculum | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchApiJson<{ data: CourseWithCurriculum }>(`/courses/slug/${slug}`),
      fetchApiJson<{ data: Lesson }>(`/lessons/by-slug?courseSlug=${slug}&lessonSlug=${lessonSlug}`, {
        auth: "required",
      }),
    ])
      .then(([courseBody, lessonBody]) => {
        setCourse(courseBody.data);
        setLesson(lessonBody.data);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug, lessonSlug]);

  // Build flat lesson list for next/prev navigation
  const allLessons =
    course?.sections.flatMap((s) =>
      s.lessons.map((l) => ({ ...l, sectionTitle: s.title })),
    ) ?? [];

  const currentIndex = allLessons.findIndex((l) => l.slug === lessonSlug);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 lg:grid lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-video animate-pulse rounded-xl bg-[var(--surface-1)]" />
          <div className="h-6 w-2/3 animate-pulse rounded bg-[var(--surface-1)]" />
        </div>
        <div className="hidden lg:block h-96 animate-pulse rounded-xl bg-[var(--surface-1)]" />
      </div>
    );
  }

  if (error || !lesson || !course) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-[var(--text-2)]">{error ?? "Lesson not found"}</p>
        <Link href={`/library/${slug}`} className="text-sm text-[var(--brand)] hover:underline">
          ← Back to course
        </Link>
      </div>
    );
  }

  const isVideo = lesson.type === "VIDEO";
  const isReady = lesson.videoAsset?.status === "READY";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:grid lg:grid-cols-3 lg:gap-8">
      {/* ─── Main content ──────────────────────────────────────────────────── */}
      <div className="lg:col-span-2 space-y-6">
        {/* Video player */}
        {isVideo && isReady ? (
          <VideoPlayer
            lessonId={lesson.id}
            courseId={course.id}
            title={lesson.title}
            onEnded={() => {
              if (nextLesson) {
                router.push(`/library/${slug}/${nextLesson.slug}`);
              }
            }}
          />
        ) : isVideo ? (
          <div className="flex aspect-video items-center justify-center rounded-xl bg-[var(--surface-1)] text-center">
            <div className="space-y-2">
              <div className="text-3xl">⏳</div>
              <p className="text-sm text-[var(--text-2)]">Video is being processed…</p>
            </div>
          </div>
        ) : null}

        {/* Lesson header */}
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Link
              href={`/library/${slug}`}
              className="text-xs text-[var(--text-3)] hover:text-[var(--text-2)]"
            >
              ← {course.title}
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-1)]">{lesson.title}</h1>
          <div className="mt-1 flex items-center gap-3 text-xs text-[var(--text-3)]">
            <span>{TYPE_ICONS[lesson.type]} {lesson.type}</span>
            {lesson.estimatedDuration && <span>{formatDuration(lesson.estimatedDuration)}</span>}
            {lesson.isFreePreview && (
              <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-green-400">
                Free preview
              </span>
            )}
          </div>
        </div>

        {lesson.description && (
          <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--text-2)]">
            {lesson.description}
          </p>
        )}

        {/* Prev / Next navigation */}
        <div className="flex items-center justify-between border-t border-[var(--surface-2)] pt-4">
          {prevLesson ? (
            <Link
              href={`/library/${slug}/${prevLesson.slug}`}
              className="flex flex-col text-left"
            >
              <span className="text-xs text-[var(--text-3)]">← Previous</span>
              <span className="mt-0.5 text-sm font-medium text-[var(--text-1)] hover:text-[var(--brand)]">
                {prevLesson.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {nextLesson && (
            <Link
              href={`/library/${slug}/${nextLesson.slug}`}
              className="flex flex-col text-right"
            >
              <span className="text-xs text-[var(--text-3)]">Next →</span>
              <span className="mt-0.5 text-sm font-medium text-[var(--text-1)] hover:text-[var(--brand)]">
                {nextLesson.title}
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* ─── Sidebar: curriculum ─────────────────────────────────────────────── */}
      <aside className="mt-8 lg:mt-0">
        <div className="sticky top-6 overflow-hidden rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)]">
          <div className="border-b border-[var(--surface-2)] px-4 py-3">
            <h2 className="text-sm font-semibold text-[var(--text-1)]">Course Content</h2>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {course.sections.map((section) => (
              <div key={section.id} className="border-b border-[var(--surface-2)] last:border-0">
                <div className="bg-[var(--surface-2)]/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-3)]">
                  {section.title}
                </div>
                {section.lessons.map((l) => {
                  const isActive = l.slug === lessonSlug;
                  return (
                    <Link
                      key={l.id}
                      href={`/library/${slug}/${l.slug}`}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--surface-2)] ${
                        isActive
                          ? "bg-[var(--brand)]/10 text-[var(--brand)]"
                          : "text-[var(--text-2)]"
                      }`}
                    >
                      <span className="shrink-0 text-xs">{TYPE_ICONS[l.type] ?? "▶"}</span>
                      <span className="flex-1 leading-snug">{l.title}</span>
                      <span className="shrink-0 text-xs text-[var(--text-3)]">
                        {formatDuration(l.estimatedDuration)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
