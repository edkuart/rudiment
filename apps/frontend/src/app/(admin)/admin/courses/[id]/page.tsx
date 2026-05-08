"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  GripVertical, Plus, Pencil, Trash2, Eye,
  Video, FileText, Dumbbell, Star, Layers,
} from "lucide-react";
import { coursesClient, type CourseListItem } from "@/lib/api/courses-client";
import { fetchApiData, fetchApiJson } from "@/lib/api-fetch";

const DIFFICULTIES = ["ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
const ACCESS_TYPES = ["FREE", "SUBSCRIPTION", "PURCHASE"] as const;
const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
const LESSON_TYPES = ["VIDEO", "PDF", "EXERCISE", "MASTERCLASS", "BREAKDOWN"] as const;

const TYPE_ICONS: Record<string, React.ElementType> = {
  VIDEO: Video, PDF: FileText, EXERCISE: Dumbbell, MASTERCLASS: Star, BREAKDOWN: Layers,
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-yellow-500/10 text-yellow-400",
  PUBLISHED: "bg-green-500/10 text-green-400",
  ARCHIVED: "bg-[var(--surface-3)] text-[var(--text-3)]",
};

const INPUT =
  "w-full rounded-lg border border-[var(--surface-3)] bg-[var(--surface-0)] px-3 py-2 text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:border-[var(--brand)] focus:outline-none transition-colors";

interface Lesson {
  id: string;
  title: string;
  type: string;
  status: string;
  position: number;
  isFreePreview: boolean;
  estimatedDuration: number | null;
  videoAsset?: { status: string; muxPlaybackId: string | null } | null;
}

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<CourseListItem | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", subtitle: "", description: "",
    difficulty: "ALL", accessType: "SUBSCRIPTION", status: "DRAFT", tags: "",
  });
  const [newLesson, setNewLesson] = useState({ title: "", type: "VIDEO" });
  const [addingLesson, setAddingLesson] = useState(false);

  const loadLessons = useCallback(async () => {
    const data = await fetchApiData<Lesson[]>(`/courses/${id}/lessons`, { auth: "required" }).catch(() => [] as Lesson[]);
    setLessons(data);
  }, [id]);

  useEffect(() => {
    Promise.all([
      coursesClient.getById(id) as Promise<any>,
      fetchApiData<Lesson[]>(`/courses/${id}/lessons`, { auth: "required" }).catch(() => [] as Lesson[]),
    ]).then(([c, ls]) => {
      setCourse(c);
      setLessons(ls ?? []);
      setForm({
        title: c.title ?? "", subtitle: c.subtitle ?? "", description: c.description ?? "",
        difficulty: c.difficulty ?? "ALL", accessType: c.accessType ?? "SUBSCRIPTION",
        status: c.status ?? "DRAFT", tags: (c.tags ?? []).join(", "),
      });
    }).catch(() => toast.error("Failed to load course"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
      await coursesClient.update(id, { ...form, tags });
      toast.success("Course saved");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLesson.title.trim()) return;
    setAddingLesson(true);
    try {
      await coursesClient.createLesson(id, newLesson);
      toast.success("Lesson added");
      setNewLesson({ title: "", type: "VIDEO" });
      await loadLessons();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to add lesson");
    } finally {
      setAddingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await fetchApiJson(`/courses/lessons/${lessonId}`, { method: "DELETE", auth: "required" });
      toast.success("Lesson deleted");
      setLessons((ls) => ls.filter((l) => l.id !== lessonId));
    } catch {
      toast.error("Failed to delete lesson");
    }
  };

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--brand)] border-t-transparent" />
      </div>
    );
  }

  if (!course) {
    return <div className="flex h-64 items-center justify-center text-[var(--text-3)]">Course not found.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => router.push("/admin/courses")} className="mb-1 text-xs text-[var(--text-3)] hover:text-[var(--text-2)]">
            ← Courses
          </button>
          <h1 className="text-2xl font-bold text-[var(--text-1)]">{course.title}</h1>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[course.status] ?? ""}`}>
          {course.status}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Course details form */}
          <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)] p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-3)]">Details</h2>
            <Field label="Title *">
              <input required minLength={3} value={form.title} onChange={(e) => set("title", e.target.value)} className={INPUT} />
            </Field>
            <Field label="Subtitle">
              <input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="Short tagline" className={INPUT} />
            </Field>
            <Field label="Description">
              <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} className={`${INPUT} resize-none`} />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Status">
                <select value={form.status} onChange={(e) => set("status", e.target.value)} className={INPUT}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Difficulty">
                <select value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)} className={INPUT}>
                  {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Access">
                <select value={form.accessType} onChange={(e) => set("accessType", e.target.value)} className={INPUT}>
                  {ACCESS_TYPES.map((a) => <option key={a}>{a}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Tags (comma separated)">
              <input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="rudiments, technique, beginner" className={INPUT} />
            </Field>
            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="rounded-lg bg-[var(--brand)] px-6 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>

          {/* Lessons list */}
          <div className="rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)]">
            <div className="border-b border-[var(--surface-2)] px-5 py-4">
              <h2 className="text-sm font-semibold text-[var(--text-1)]">
                Lessons
                <span className="ml-2 rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-xs text-[var(--text-3)]">
                  {lessons.length}
                </span>
              </h2>
            </div>

            {lessons.length === 0 ? (
              <div className="flex h-20 items-center justify-center text-sm text-[var(--text-3)]">
                No lessons yet
              </div>
            ) : (
              <div className="divide-y divide-[var(--surface-2)]">
                {lessons.map((lesson, idx) => {
                  const Icon = TYPE_ICONS[lesson.type] ?? Video;
                  return (
                    <div key={lesson.id} className="group flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-2)]/30">
                      <GripVertical size={14} className="shrink-0 text-[var(--surface-3)] group-hover:text-[var(--text-3)]" />
                      <span className="w-5 shrink-0 text-center text-xs text-[var(--text-3)]">{idx + 1}</span>
                      <Icon size={14} className="shrink-0 text-[var(--text-3)]" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[var(--text-1)]">{lesson.title}</p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${STATUS_COLORS[lesson.status] ?? ""}`}>
                            {lesson.status}
                          </span>
                          {lesson.isFreePreview && (
                            <span className="text-[10px] text-[var(--brand)]">Free preview</span>
                          )}
                          {lesson.estimatedDuration && (
                            <span className="text-[10px] text-[var(--text-3)]">{lesson.estimatedDuration}min</span>
                          )}
                          {lesson.videoAsset?.muxPlaybackId && (
                            <span className="text-[10px] text-green-400">Video ready</span>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Link
                          href={`/admin/courses/${id}/lessons/${lesson.id}`}
                          className="rounded p-1.5 text-[var(--text-3)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)] transition-colors"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </Link>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                          className="rounded p-1.5 text-[var(--text-3)] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="border-t border-[var(--surface-2)] p-4">
              <form onSubmit={handleAddLesson} className="flex gap-2">
                <input
                  required
                  value={newLesson.title}
                  onChange={(e) => setNewLesson((f) => ({ ...f, title: e.target.value }))}
                  placeholder="New lesson title…"
                  className={`${INPUT} flex-1`}
                />
                <select
                  value={newLesson.type}
                  onChange={(e) => setNewLesson((f) => ({ ...f, type: e.target.value }))}
                  className="rounded-lg border border-[var(--surface-3)] bg-[var(--surface-0)] px-3 py-2 text-sm text-[var(--text-1)] focus:border-[var(--brand)] focus:outline-none"
                >
                  {LESSON_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <button
                  type="submit"
                  disabled={addingLesson}
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--surface-2)] px-4 py-2 text-sm font-medium text-[var(--text-1)] hover:bg-[var(--surface-3)] disabled:opacity-50"
                >
                  <Plus size={14} />
                  {addingLesson ? "Adding…" : "Add"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)] p-5">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-3)]">Stats</h3>
            <div className="space-y-3">
              <Stat label="Total Lessons" value={lessons.length} />
              <Stat label="Published" value={lessons.filter((l) => l.status === "PUBLISHED").length} />
              <Stat label="Draft" value={lessons.filter((l) => l.status === "DRAFT").length} />
              <Stat label="Free Previews" value={lessons.filter((l) => l.isFreePreview).length} />
              <Stat label="With Video" value={lessons.filter((l) => l.videoAsset?.muxPlaybackId).length} />
            </div>
          </div>

          <div className="rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)] p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-3)]">Actions</h3>
            <a
              href={`/library/${course.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)] transition-colors"
            >
              <Eye size={14} />
              Preview as student
            </a>
          </div>
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[var(--text-2)]">{label}</span>
      <span className="font-semibold text-[var(--text-1)]">{value}</span>
    </div>
  );
}
