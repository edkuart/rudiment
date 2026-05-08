"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Clock, Eye, Music2, CheckCircle2 } from "lucide-react";
import { VideoUploader } from "@/components/video/VideoUploader";
import { fetchApiData, fetchApiJson } from "@/lib/api-fetch";

const INPUT =
  "w-full rounded-lg border border-[var(--surface-3)] bg-[var(--surface-0)] px-3 py-2 text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:border-[var(--brand)] focus:outline-none transition-colors";

const LESSON_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

const TIME_SIGNATURES = ["4/4", "3/4", "6/8", "5/4", "7/8", "12/8", "2/4", "9/8"] as const;

const TECHNIQUE_OPTIONS = [
  "Single Stroke", "Double Stroke", "Paradiddle", "Ghost Notes",
  "Blast Beats", "Linear Drumming", "Polyrhythm", "Rudiments",
  "Brush Technique", "Jazz Comping", "Independence", "Speed Building",
  "Dynamics", "Accents", "Flams", "Drags",
];

const STYLE_OPTIONS = [
  "Rock", "Jazz", "Funk", "Blues", "Metal", "Latin",
  "R&B", "Hip-Hop", "Country", "Fusion", "World", "Pop",
];

interface LessonDetail {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  isFreePreview: boolean;
  estimatedDuration: number | null;
  bpmMin: number | null;
  bpmMax: number | null;
  timeSignature: string | null;
  techniques: string[];
  styles: string[];
  videoAsset?: {
    id: string;
    status: string;
    muxPlaybackId: string | null;
    duration: number | null;
  } | null;
}

interface MusicMeta {
  bpmMin: string;
  bpmMax: string;
  timeSignature: string;
  techniques: string[];
  styles: string[];
}

function TagToggle({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-[var(--brand)]/15 text-[var(--brand)] ring-1 ring-[var(--brand)]/30"
          : "bg-[var(--surface-2)] text-[var(--text-2)] hover:bg-[var(--surface-3)]"
      }`}
    >
      {label}
    </button>
  );
}

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
  const [music, setMusic] = useState<MusicMeta>({
    bpmMin: "", bpmMax: "", timeSignature: "4/4",
    techniques: [], styles: [],
  });
  const [savingMusic, setSavingMusic] = useState(false);

  const load = useCallback(() => {
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
        setMusic({
          bpmMin: l.bpmMin ? String(l.bpmMin) : "",
          bpmMax: l.bpmMax ? String(l.bpmMax) : "",
          timeSignature: l.timeSignature ?? "4/4",
          techniques: l.techniques ?? [],
          styles: l.styles ?? [],
        });
      })
      .catch(() => toast.error("Failed to load lesson"))
      .finally(() => setLoading(false));
  }, [lessonId]);

  useEffect(() => { load(); }, [load]);

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

  const handleSaveMusic = async () => {
    setSavingMusic(true);
    try {
      await fetchApiJson<{ data: LessonDetail }>(`/courses/lessons/${lessonId}`, {
        method: "PATCH",
        auth: "required",
        body: JSON.stringify({
          bpmMin: music.bpmMin ? Number(music.bpmMin) : undefined,
          bpmMax: music.bpmMax ? Number(music.bpmMax) : undefined,
          timeSignature: music.timeSignature || undefined,
          techniques: music.techniques,
          styles: music.styles,
        }),
      });
      toast.success("Music metadata saved");
    } catch {
      toast.error("Failed to save music metadata");
    } finally {
      setSavingMusic(false);
    }
  };

  const toggleTechnique = (t: string) =>
    setMusic((m) => ({
      ...m,
      techniques: m.techniques.includes(t)
        ? m.techniques.filter((x) => x !== t)
        : [...m.techniques, t],
    }));

  const toggleStyle = (s: string) =>
    setMusic((m) => ({
      ...m,
      styles: m.styles.includes(s)
        ? m.styles.filter((x) => x !== s)
        : [...m.styles, s],
    }));

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--brand)] border-t-transparent" />
      </div>
    );
  }

  if (!lesson) {
    return <div className="flex h-64 items-center justify-center text-[var(--text-3)]">Lesson not found.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push(`/admin/courses/${courseId}`)}
          className="mb-1 text-xs text-[var(--text-3)] hover:text-[var(--text-2)]"
        >
          ← {lesson.type} · {lesson.status}
        </button>
        <h1 className="text-2xl font-bold text-[var(--text-1)]">{lesson.title}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Left */}
        <div className="space-y-5">
          {/* Core details */}
          <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)] p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-3)]">Lesson Details</h2>

            <Field label="Title *">
              <input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={INPUT}
              />
            </Field>

            <Field label="Description / Learning objectives">
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="What students will learn in this lesson…"
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
                  {LESSON_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Duration (minutes)">
                <input
                  type="number"
                  min="0"
                  value={form.estimatedDuration}
                  onChange={(e) => setForm((f) => ({ ...f, estimatedDuration: e.target.value }))}
                  placeholder="e.g. 12"
                  className={INPUT}
                />
              </Field>
            </div>

            <label className="flex cursor-pointer select-none items-center gap-2.5">
              <input
                type="checkbox"
                checked={form.isFreePreview}
                onChange={(e) => setForm((f) => ({ ...f, isFreePreview: e.target.checked }))}
                className="h-4 w-4 rounded border-[var(--surface-3)] accent-[var(--brand)]"
              />
              <div>
                <span className="text-sm font-medium text-[var(--text-1)]">Free preview</span>
                <p className="text-xs text-[var(--text-3)]">Visible to non-subscribers</p>
              </div>
            </label>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[var(--brand)] px-6 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Lesson"}
              </button>
            </div>
          </form>

          {/* Video — only for VIDEO type */}
          {lesson.type === "VIDEO" && (
            <div className="rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-3)]">Video</h2>
                {lesson.videoAsset?.status === "ready" && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle2 size={12} />
                    Ready
                  </span>
                )}
              </div>
              <VideoUploader
                lessonId={lesson.id}
                currentStatus={lesson.videoAsset?.status ?? null}
                onUploadComplete={load}
              />
              {lesson.videoAsset?.duration && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-[var(--text-3)]">
                  <Clock size={11} />
                  {Math.floor(lesson.videoAsset.duration / 60)}m {Math.round(lesson.videoAsset.duration % 60)}s
                </p>
              )}
            </div>
          )}

          {/* Music metadata */}
          <div className="rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)] p-6">
            <div className="mb-4 flex items-center gap-2">
              <Music2 size={14} className="text-[var(--brand)]" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-3)]">Music Metadata</h2>
            </div>

            <div className="space-y-5">
              {/* BPM + Time signature */}
              <div className="grid grid-cols-3 gap-3">
                <Field label="BPM Min">
                  <input
                    type="number" min="20" max="400"
                    value={music.bpmMin}
                    onChange={(e) => setMusic((m) => ({ ...m, bpmMin: e.target.value }))}
                    placeholder="60"
                    className={INPUT}
                  />
                </Field>
                <Field label="BPM Max">
                  <input
                    type="number" min="20" max="400"
                    value={music.bpmMax}
                    onChange={(e) => setMusic((m) => ({ ...m, bpmMax: e.target.value }))}
                    placeholder="120"
                    className={INPUT}
                  />
                </Field>
                <Field label="Time Signature">
                  <select
                    value={music.timeSignature}
                    onChange={(e) => setMusic((m) => ({ ...m, timeSignature: e.target.value }))}
                    className={INPUT}
                  >
                    {TIME_SIGNATURES.map((ts) => <option key={ts}>{ts}</option>)}
                  </select>
                </Field>
              </div>

              {/* Techniques */}
              <Field label="Techniques">
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {TECHNIQUE_OPTIONS.map((t) => (
                    <TagToggle
                      key={t}
                      label={t}
                      active={music.techniques.includes(t)}
                      onToggle={() => toggleTechnique(t)}
                    />
                  ))}
                </div>
              </Field>

              {/* Styles */}
              <Field label="Style / Genre">
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {STYLE_OPTIONS.map((s) => (
                    <TagToggle
                      key={s}
                      label={s}
                      active={music.styles.includes(s)}
                      onToggle={() => toggleStyle(s)}
                    />
                  ))}
                </div>
              </Field>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSaveMusic}
                  disabled={savingMusic}
                  className="rounded-lg bg-[var(--brand)] px-6 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {savingMusic ? "Saving…" : "Save Music Metadata"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right — sidebar info */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)] p-5">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-3)]">Info</h3>
            <div className="space-y-2.5 text-sm">
              <InfoRow label="Type" value={lesson.type} />
              <InfoRow label="Status" value={lesson.status} />
              <InfoRow
                label="Duration"
                value={form.estimatedDuration ? `${form.estimatedDuration}min` : "—"}
              />
              <InfoRow
                label="Free Preview"
                value={form.isFreePreview ? "Yes" : "No"}
              />
              <InfoRow
                label="Video"
                value={lesson.videoAsset?.status ?? "None"}
              />
            </div>
          </div>

          {lesson.videoAsset?.muxPlaybackId && (
            <div className="rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)] p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-3)]">Preview</h3>
              <a
                href={`/library`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-[var(--brand)] hover:underline"
              >
                <Eye size={12} />
                View in library
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-3)]">
        {label}
      </label>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--text-3)]">{label}</span>
      <span className="font-medium text-[var(--text-1)]">{value}</span>
    </div>
  );
}
