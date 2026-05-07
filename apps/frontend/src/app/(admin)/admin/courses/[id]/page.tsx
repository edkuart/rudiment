"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { coursesClient, type CourseListItem } from "@/lib/api/courses-client";
import { toast } from "sonner";

const DIFFICULTIES = ["ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
const ACCESS_TYPES = ["FREE", "SUBSCRIPTION", "PURCHASE"] as const;
const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
const LESSON_TYPES = ["VIDEO", "PDF", "EXERCISE", "MASTERCLASS", "BREAKDOWN"] as const;

const INPUT =
  "w-full rounded-lg border border-[var(--surface-3)] bg-[var(--surface-0)] px-3 py-2 text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:border-[var(--brand)] focus:outline-none transition-colors";

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<CourseListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    difficulty: "ALL",
    accessType: "SUBSCRIPTION",
    status: "DRAFT",
    tags: "",
  });
  const [newLesson, setNewLesson] = useState({ title: "", type: "VIDEO" });
  const [addingLesson, setAddingLesson] = useState(false);

  useEffect(() => {
    coursesClient
      .getById(id)
      .then((c: any) => {
        setCourse(c);
        setForm({
          title: c.title ?? "",
          subtitle: c.subtitle ?? "",
          description: c.description ?? "",
          difficulty: c.difficulty ?? "ALL",
          accessType: c.accessType ?? "SUBSCRIPTION",
          status: c.status ?? "DRAFT",
          tags: (c.tags ?? []).join(", "),
        });
      })
      .catch(() => toast.error("Failed to load course"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await coursesClient.update(id, {
        title: form.title,
        subtitle: form.subtitle || undefined,
        description: form.description || undefined,
        difficulty: form.difficulty,
        accessType: form.accessType,
        status: form.status,
        tags,
      });
      toast.success("Course saved");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingLesson(true);
    try {
      await coursesClient.createLesson(id, {
        title: newLesson.title,
        type: newLesson.type,
      });
      toast.success("Lesson added");
      setNewLesson({ title: "", type: "VIDEO" });
      const updated = await coursesClient.getById(id) as any;
      setCourse(updated);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to add lesson");
    } finally {
      setAddingLesson(false);
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
    return (
      <div className="flex h-64 items-center justify-center text-[var(--text-3)]">
        Course not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push("/admin/courses")}
            className="mb-1 text-xs text-[var(--text-3)] hover:text-[var(--text-2)]"
          >
            ← Back to courses
          </button>
          <h1 className="text-2xl font-bold text-[var(--text-1)]">{course.title}</h1>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            course.status === "PUBLISHED"
              ? "bg-green-500/10 text-green-400"
              : course.status === "DRAFT"
                ? "bg-yellow-500/10 text-yellow-400"
                : "bg-[var(--surface-3)] text-[var(--text-3)]"
          }`}
        >
          {course.status}
        </span>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)] p-6"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-3)]">
          Course Details
        </h2>

        <Field label="Title *">
          <input required minLength={3} value={form.title} onChange={(e) => set("title", e.target.value)} className={INPUT} />
        </Field>
        <Field label="Subtitle">
          <input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="Short tagline" className={INPUT} />
        </Field>
        <Field label="Description">
          <textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} className={`${INPUT} resize-none`} />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Status">
            <select value={form.status} onChange={(e) => set("status", e.target.value)} className={INPUT}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Difficulty">
            <select value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)} className={INPUT}>
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Access">
            <select value={form.accessType} onChange={(e) => set("accessType", e.target.value)} className={INPUT}>
              {ACCESS_TYPES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Tags (comma separated)">
          <input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="rudiments, technique" className={INPUT} />
        </Field>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[var(--brand)] px-6 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)] p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-3)]">
          Add Lesson
        </h2>
        <form onSubmit={handleAddLesson} className="flex gap-3">
          <input
            required
            value={newLesson.title}
            onChange={(e) => setNewLesson((f) => ({ ...f, title: e.target.value }))}
            placeholder="Lesson title"
            className={`${INPUT} flex-1`}
          />
          <select
            value={newLesson.type}
            onChange={(e) => setNewLesson((f) => ({ ...f, type: e.target.value }))}
            className="w-36 rounded-lg border border-[var(--surface-3)] bg-[var(--surface-0)] px-3 py-2 text-sm text-[var(--text-1)] focus:border-[var(--brand)] focus:outline-none"
          >
            {LESSON_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button
            type="submit"
            disabled={addingLesson}
            className="rounded-lg bg-[var(--surface-2)] px-4 py-2 text-sm font-medium text-[var(--text-1)] hover:bg-[var(--surface-3)] disabled:opacity-50 whitespace-nowrap"
          >
            {addingLesson ? "Adding…" : "Add"}
          </button>
        </form>
        <p className="mt-3 text-xs text-[var(--text-3)]">
          {course.totalLessons} lesson{course.totalLessons === 1 ? "" : "s"} in this course
        </p>
      </div>
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
