"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { coursesClient } from "@/lib/api/courses-client";
import { toast } from "sonner";

const DIFFICULTIES = ["ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
const ACCESS_TYPES = ["FREE", "SUBSCRIPTION", "PURCHASE"] as const;

const INPUT =
  "w-full rounded-lg border border-[var(--surface-3)] bg-[var(--surface-0)] px-3 py-2 text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:border-[var(--brand)] focus:outline-none transition-colors";

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    difficulty: "ALL" as string,
    accessType: "SUBSCRIPTION" as string,
    tags: "",
  });

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const course = await coursesClient.create({
        title: form.title,
        subtitle: form.subtitle || undefined,
        description: form.description || undefined,
        difficulty: form.difficulty,
        accessType: form.accessType,
        tags: tags.length > 0 ? tags : undefined,
      });
      toast.success("Course created");
      router.push(`/admin/courses/${course.id}`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-1)]">New Course</h1>
        <p className="mt-1 text-sm text-[var(--text-2)]">Fill in the details to create a new course.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)] p-6"
      >
        <Field label="Title *">
          <input
            required
            minLength={3}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Single Stroke Mastery"
            className={INPUT}
          />
        </Field>

        <Field label="Subtitle">
          <input
            value={form.subtitle}
            onChange={(e) => set("subtitle", e.target.value)}
            placeholder="Short tagline"
            className={INPUT}
          />
        </Field>

        <Field label="Description">
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="What students will learn…"
            className={`${INPUT} resize-none`}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Difficulty">
            <select
              value={form.difficulty}
              onChange={(e) => set("difficulty", e.target.value)}
              className={INPUT}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Access Type">
            <select
              value={form.accessType}
              onChange={(e) => set("accessType", e.target.value)}
              className={INPUT}
            >
              {ACCESS_TYPES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Tags (comma separated)">
          <input
            value={form.tags}
            onChange={(e) => set("tags", e.target.value)}
            placeholder="rudiments, technique, beginner"
            className={INPUT}
          />
        </Field>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--text-2)] hover:text-[var(--text-1)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-[var(--brand)] px-6 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create Course"}
          </button>
        </div>
      </form>
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
