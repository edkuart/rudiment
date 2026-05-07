"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { VideoUploader } from "@/components/video/VideoUploader";
import { fetchApiData, fetchApiJson } from "@/lib/api-fetch";
const INPUT =
  "w-full rounded-lg border border-[var(--surface-3)] bg-[var(--surface-0)] px-3 py-2 text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:border-[var(--brand)] focus:outline-none transition-colors";

interface LessonDetail {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  isFreePreview: boolean;
  estimatedDuration: number | null;
  videoAsset?: {
    id: string;
    status: string;
    muxPlaybackId: string | null;
    duration: number | null;
  } | null;
}

const LESSON_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export default function AdminLessonPage() {
  const { id: courseId, lessonId } = useParams<{ id: string; lessonId: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "DRAFT",
    isFreePreview: false,
    estimatedDuration: "",
  });

  const load = () => {
    fetchApiData<LessonDetail>(`/courses/lessons/${lessonId}`, { auth: "required" })
      .then((l) => {
        setLesson(l);
        setForm({
          title: l.title ?? "",
          description: l.description ?? "",
          status: l.status ?? "DRAFT",
          isFreePreview: l.isFreePreview ?? false,
          estimatedDuration: l.estimatedDuration ? String(l.estimatedDuration) : "",
        });
      })
      .catch(() => toast.error("Failed to load lesson"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [lessonId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchApiJson<{ data: LessonDetail }>(`/courses/lessons/${lessonId}`, {
        method: "PATCH",
        auth: "required",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          status: form.status,
          isFreePreview: form.isFreePreview,
          estimatedDuration: form.estimatedDuration ? Number(form.estimatedDuration) : undefined,
        }),
      });
      toast.success("Lesson saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--brand)] border-t-transparent" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--text-3)]">
        Lesson not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push(`/admin/courses/${courseId}`)}
          className="mb-1 text-xs text-[var(--text-3)] hover:text-[var(--text-2)]"
        >
          ← Back to course
        </button>
        <h1 className="text-2xl font-bold text-[var(--text-1)]">{lesson.title}</h1>
        <p className="text-xs text-[var(--text-3)]">
          {lesson.type} · {lesson.status}
        </p>
      </div>

      {/* Details form */}
      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)] p-6"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-3)]">
          Lesson Details
        </h2>

        <Field label="Title *">
          <input
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className={INPUT}
          />
        </Field>

        <Field label="Description">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className={`${INPUT} resize-none`}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className={INPUT}
            >
              {LESSON_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>

          <Field label="Duration (seconds)">
            <input
              type="number"
              min="0"
              value={form.estimatedDuration}
              onChange={(e) => setForm((f) => ({ ...f, estimatedDuration: e.target.value }))}
              placeholder="e.g. 720 = 12min"
              className={INPUT}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.isFreePreview}
            onChange={(e) => setForm((f) => ({ ...f, isFreePreview: e.target.checked }))}
            className="h-4 w-4 rounded border-[var(--surface-3)] accent-[var(--brand)]"
          />
          <span className="text-sm text-[var(--text-1)]">Free preview — visible without subscription</span>
        </label>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[var(--brand)] px-6 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Lesson"}
          </button>
        </div>
      </form>

      {/* Video upload section — only for VIDEO type lessons */}
      {lesson.type === "VIDEO" && (
        <div className="rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)] p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-3)]">
            Video
          </h2>
          <VideoUploader
            lessonId={lesson.id}
            currentStatus={lesson.videoAsset?.status ?? null}
            onUploadComplete={load}
          />
          {lesson.videoAsset?.duration && (
            <p className="mt-3 text-xs text-[var(--text-3)]">
              Duration: {Math.round(lesson.videoAsset.duration / 60)}m{" "}
              {lesson.videoAsset.duration % 60}s
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-3)]">
        {label}
      </label>
      {children}
    </div>
  );
}
