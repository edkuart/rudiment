"use client";

import { useRef, useState } from "react";
import { fetchApiJson } from "@/lib/api-fetch";

interface VideoUploaderProps {
  lessonId: string;
  currentStatus?: string | null;
  onUploadComplete?: () => void;
}

interface UploadData {
  uploadId: string;
  uploadUrl: string;
}

type UploadState = "idle" | "requesting" | "uploading" | "processing" | "done" | "error";

export function VideoUploader({ lessonId, currentStatus, onUploadComplete }: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>(
    currentStatus === "READY" ? "done" : currentStatus === "PREPARING" ? "processing" : "idle",
  );
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      setErrorMsg("Please select a video file");
      return;
    }

    setState("requesting");
    setErrorMsg(null);

    try {
      // Step 1: Get a Mux direct upload URL from our API
      const { data } = await fetchApiJson<{ data: UploadData }>("/videos/upload", {
        method: "POST",
        auth: "required",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });

      // Step 2: Upload the file directly to Mux
      setState("uploading");

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", data.uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };

        xhr.onload = () => (xhr.status < 400 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)));
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(file);
      });

      setState("processing");
      setProgress(100);
      onUploadComplete?.();
    } catch (err: any) {
      setState("error");
      setErrorMsg(err.message ?? "Upload failed");
    }
  };

  const STATUS_MAP: Record<string, { label: string; color: string }> = {
    WAITING: { label: "Waiting", color: "text-[var(--text-3)]" },
    PREPARING: { label: "Processing", color: "text-yellow-400" },
    READY: { label: "Ready", color: "text-green-400" },
    ERRORED: { label: "Error", color: "text-red-400" },
  };

  return (
    <div className="space-y-3">
      {/* Current status badge */}
      {currentStatus && (
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${STATUS_MAP[currentStatus]?.color ?? ""}`}>
            ● {STATUS_MAP[currentStatus]?.label ?? currentStatus}
          </span>
        </div>
      )}

      {/* Upload area */}
      {state === "idle" || state === "error" ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--surface-3)] p-8 transition-colors hover:border-[var(--brand)]/50 hover:bg-[var(--brand)]/5"
        >
          <span className="text-3xl">🎬</span>
          <p className="text-sm font-medium text-[var(--text-1)]">Click to upload video</p>
          <p className="text-xs text-[var(--text-3)]">MP4, MOV, or MKV — up to 10GB</p>
          {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
        </div>
      ) : state === "requesting" ? (
        <StatusBanner icon="⏳" message="Preparing upload…" />
      ) : state === "uploading" ? (
        <div className="space-y-2 rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)] p-4">
          <div className="flex justify-between text-xs text-[var(--text-2)]">
            <span>Uploading to Mux…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-3)]">
            <div
              className="h-full rounded-full bg-[var(--brand)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : state === "processing" ? (
        <StatusBanner
          icon="⚙️"
          message="Mux is processing your video. This may take a few minutes."
          hint="You'll see it in the lesson once it's ready."
        />
      ) : state === "done" ? (
        <StatusBanner icon="✅" message="Video is ready for playback." success />
      ) : null}
    </div>
  );
}

function StatusBanner({
  icon,
  message,
  hint,
  success,
}: {
  icon: string;
  message: string;
  hint?: string;
  success?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 ${
        success
          ? "border-green-500/20 bg-green-500/5"
          : "border-[var(--surface-2)] bg-[var(--surface-1)]"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-sm text-[var(--text-1)]">{message}</p>
        {hint && <p className="mt-0.5 text-xs text-[var(--text-3)]">{hint}</p>}
      </div>
    </div>
  );
}
