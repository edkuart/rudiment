"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchApiData, fetchApiJson } from "@/lib/api-fetch";

const INPUT =
  "w-full rounded-lg border border-[var(--surface-3)] bg-[var(--surface-0)] px-3 py-2 text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:border-[var(--brand)] focus:outline-none transition-colors";

const SKILL_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

interface Profile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  profile?: {
    bio: string | null;
    skillLevel: string | null;
    timezone: string | null;
    onboardingCompletedAt: string | null;
  } | null;
}

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    avatarUrl: "",
    bio: "",
    skillLevel: "",
    timezone: "",
  });

  useEffect(() => {
    fetchApiData<Profile>("/auth/me/profile", { auth: "required" })
      .then((p) => {
        setProfile(p);
        setForm({
          displayName: p.displayName ?? "",
          avatarUrl: p.avatarUrl ?? "",
          bio: p.profile?.bio ?? "",
          skillLevel: p.profile?.skillLevel ?? "",
          timezone: p.profile?.timezone ?? "UTC",
        });
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchApiJson<{ data: Profile }>("/auth/me/profile", {
        method: "PATCH",
        auth: "required",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.displayName || undefined,
          avatarUrl: form.avatarUrl || undefined,
          bio: form.bio || undefined,
          skillLevel: form.skillLevel || undefined,
          timezone: form.timezone || undefined,
        }),
      });
      toast.success("Profile saved");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--surface-1)]" />
        <div className="h-64 animate-pulse rounded-xl bg-[var(--surface-1)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-[var(--text-1)]">Profile Settings</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6 rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)] p-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--brand)]/10 text-2xl font-bold text-[var(--brand)]">
            {form.displayName?.[0]?.toUpperCase() ?? profile?.email?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--text-1)]">{profile?.email}</p>
            <p className="mt-0.5 text-xs text-[var(--text-3)]">Avatar URL</p>
            <input
              type="url"
              value={form.avatarUrl}
              onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
              placeholder="https://…"
              className={`${INPUT} mt-2`}
            />
          </div>
        </div>

        {/* Basic info */}
        <div className="space-y-4 rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-3)]">
            Basic Info
          </h2>

          <Field label="Display Name">
            <input
              type="text"
              required
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              className={INPUT}
            />
          </Field>

          <Field label="Bio">
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="Tell us about yourself…"
              className={`${INPUT} resize-none`}
            />
          </Field>
        </div>

        {/* Drum preferences */}
        <div className="space-y-4 rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-3)]">
            Drum Preferences
          </h2>

          <Field label="Skill Level">
            <select
              value={form.skillLevel}
              onChange={(e) => setForm((f) => ({ ...f, skillLevel: e.target.value }))}
              className={INPUT}
            >
              <option value="">— select —</option>
              {SKILL_LEVELS.map((s) => (
                <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </Field>

          <Field label="Timezone">
            <input
              type="text"
              value={form.timezone}
              onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
              placeholder="UTC, America/New_York…"
              className={INPUT}
            />
          </Field>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[var(--brand)] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
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
