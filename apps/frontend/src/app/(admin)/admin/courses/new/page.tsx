"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X, Loader2, Upload } from "lucide-react";
import { coursesClient } from "@/lib/api/courses-client";
import { fetchApiJson } from "@/lib/api-fetch";
import { toast } from "sonner";

const DIFFICULTIES = ["ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
const ACCESS_TYPES = ["FREE", "SUBSCRIPTION", "PURCHASE"] as const;

const INPUT =
  "w-full rounded-lg border border-[var(--surface-3)] bg-[var(--surface-0)] px-3 py-2 text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:border-[var(--brand)] focus:outline-none transition-colors";

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [draggingThumb, setDraggingThumb] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    difficulty: "ALL" as string,
    accessType: "SUBSCRIPTION" as string,
    tags: "",
  });

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const uploadImage = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setUploadingThumb(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await fetchApiJson<{ data: { url: string } }>("/uploads/images", {
        method: "POST",
        auth: "required",
        body: formData,
      });
      setThumbnailUrl(data.url);
      toast.success("Thumbnail uploaded");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploadingThumb(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const course = await coursesClient.create({
        title: form.title,
        subtitle: form.subtitle || undefined,
        description: form.description || undefined,
        difficulty: form.difficulty,
        accessType: form.accessType,
        tags: tags.length > 0 ? tags : undefined,
        thumbnailUrl: thumbnailUrl || undefined,
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

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Thumbnail */}
        <div className="rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)] p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-3)]">Course Thumbnail</p>

          {thumbnailUrl ? (
            <div className="relative">
              <img
                src={thumbnailUrl}
                alt="Thumbnail"
                className="h-48 w-full rounded-lg object-cover bg-[var(--surface-2)]"
                onError={() => setThumbnailUrl("")}
              />
              <button
                type="button"
                onClick={() => { setThumbnailUrl(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors"
              >
                <X size={14} />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-1.5 text-xs text-white hover:bg-black/80 transition-colors"
              >
                <Upload size={11} />
                Replace
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDraggingThumb(true); }}
              onDragLeave={() => setDraggingThumb(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDraggingThumb(false);
                const file = e.dataTransfer.files[0];
                if (file) void uploadImage(file);
              }}
              onClick={() => !uploadingThumb && fileInputRef.current?.click()}
              className={`flex h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed transition-all ${
                draggingThumb
                  ? "border-[var(--brand)] bg-[var(--brand)]/8"
                  : "border-[var(--surface-3)] hover:border-[var(--brand)]/50 hover:bg-[var(--brand)]/5"
              }`}
            >
              {uploadingThumb ? (
                <>
                  <Loader2 size={22} className="animate-spin text-[var(--brand)]" />
                  <p className="text-sm text-[var(--text-2)]">Uploading…</p>
                </>
              ) : (
                <>
                  <div className="rounded-full bg-[var(--surface-2)] p-3">
                    <ImagePlus size={20} className="text-[var(--text-3)]" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-[var(--text-1)]">
                      {draggingThumb ? "Drop image here" : "Drag & drop or click to upload"}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--text-3)]">PNG, JPG, WebP — up to 10 MB</p>
                  </div>
                </>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadImage(file);
            }}
          />
        </div>

        {/* Details */}
        <div className="space-y-4 rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-3)]">Details</p>

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
              placeholder="Short tagline shown under the title"
              className={INPUT}
            />
          </Field>

          <Field label="Description">
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What students will learn in this course…"
              className={`${INPUT} resize-none`}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Difficulty">
              <select value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)} className={INPUT}>
                {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Access Type">
              <select value={form.accessType} onChange={(e) => set("accessType", e.target.value)} className={INPUT}>
                {ACCESS_TYPES.map((a) => <option key={a}>{a}</option>)}
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
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--text-2)] hover:text-[var(--text-1)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploadingThumb}
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
