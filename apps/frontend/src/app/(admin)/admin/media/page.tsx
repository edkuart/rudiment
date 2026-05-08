"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Video, Clock, AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { fetchApiData } from "@/lib/api-fetch";

interface VideoAsset {
  id: string;
  status: string;
  muxUploadId: string | null;
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  duration: number | null;
  aspectRatio: string | null;
  resolution: string | null;
  thumbnailUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  lesson: {
    id: string;
    title: string;
    courseId: string;
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  WAITING:    { label: "Waiting",    color: "bg-[var(--surface-3)] text-[var(--text-3)]",   icon: Clock },
  PREPARING:  { label: "Preparing",  color: "bg-blue-500/10 text-blue-400",                  icon: Loader2 },
  READY:      { label: "Ready",      color: "bg-green-500/10 text-green-400",                icon: CheckCircle2 },
  ERRORED:    { label: "Error",      color: "bg-red-500/10 text-red-400",                    icon: AlertCircle },
};

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<VideoAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const load = useCallback(() => {
    setLoading(true);
    fetchApiData<VideoAsset[]>("/videos", { auth: "required" })
      .then(setAssets)
      .catch(() => toast.error("Failed to load media library"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === "ALL" ? assets : assets.filter((a) => a.status === filter);

  const counts = {
    ALL: assets.length,
    WAITING: assets.filter((a) => a.status === "WAITING").length,
    PREPARING: assets.filter((a) => a.status === "PREPARING").length,
    READY: assets.filter((a) => a.status === "READY").length,
    ERRORED: assets.filter((a) => a.status === "ERRORED").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-1)]">Media Library</h1>
          <p className="mt-0.5 text-sm text-[var(--text-3)]">All video assets across lessons</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--surface-3)] px-3 py-2 text-sm text-[var(--text-2)] hover:bg-[var(--surface-2)] transition-colors"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-lg bg-[var(--surface-1)] p-1 border border-[var(--surface-2)] w-fit">
        {(["ALL", "READY", "PREPARING", "WAITING", "ERRORED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === s
                ? "bg-[var(--surface-0)] text-[var(--text-1)] shadow-sm"
                : "text-[var(--text-3)] hover:text-[var(--text-2)]"
            }`}
          >
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            <span className="ml-1.5 tabular-nums opacity-60">{counts[s]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--brand)] border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-[var(--surface-2)] text-[var(--text-3)]">
          <Video size={24} className="opacity-40" />
          <p className="text-sm">No video assets{filter !== "ALL" ? ` with status ${filter}` : ""}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--surface-2)]">
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-3)]">Thumbnail</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-3)]">Lesson</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-3)]">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-3)]">Duration</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-3)]">Resolution</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-3)]">Uploaded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--surface-2)]">
              {filtered.map((asset) => {
                const cfg = STATUS_CONFIG[asset.status] ?? { label: asset.status, color: "bg-[var(--surface-3)] text-[var(--text-3)]", icon: Clock };
                const StatusIcon = cfg.icon;
                return (
                  <tr key={asset.id} className="hover:bg-[var(--surface-2)]/30 transition-colors">
                    <td className="px-4 py-3">
                      {asset.thumbnailUrl ? (
                        <img
                          src={asset.thumbnailUrl}
                          alt=""
                          className="h-10 w-16 rounded object-cover bg-[var(--surface-2)]"
                        />
                      ) : (
                        <div className="flex h-10 w-16 items-center justify-center rounded bg-[var(--surface-2)]">
                          <Video size={14} className="text-[var(--text-3)]" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {asset.lesson ? (
                        <div>
                          <p className="text-sm font-medium text-[var(--text-1)]">{asset.lesson.title}</p>
                          <p className="text-xs text-[var(--text-3)] font-mono">{asset.id.slice(0, 12)}…</p>
                        </div>
                      ) : (
                        <span className="text-sm text-[var(--text-3)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}>
                        <StatusIcon size={10} className={asset.status === "PREPARING" ? "animate-spin" : ""} />
                        {cfg.label}
                      </span>
                      {asset.errorMessage && (
                        <p className="mt-0.5 text-[10px] text-red-400 max-w-[160px] truncate" title={asset.errorMessage}>
                          {asset.errorMessage}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-2)]">
                      {formatDuration(asset.duration)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-2)]">
                      {asset.resolution ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-2)]">
                      {formatDate(asset.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Videos" value={counts.ALL} />
        <StatCard label="Ready" value={counts.READY} accent="green" />
        <StatCard label="Processing" value={counts.PREPARING} accent="blue" />
        <StatCard label="Errors" value={counts.ERRORED} accent="red" />
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: "green" | "blue" | "red" }) {
  const color = accent === "green" ? "text-green-400" : accent === "blue" ? "text-blue-400" : accent === "red" ? "text-red-400" : "text-[var(--text-1)]";
  return (
    <div className="rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)] p-4">
      <p className="text-xs text-[var(--text-3)]">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}
