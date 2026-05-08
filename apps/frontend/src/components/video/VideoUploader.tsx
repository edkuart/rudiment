"use client";

import { useRef, useState, useCallback } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { fetchApiJson } from "@/lib/api-fetch";

interface VideoUploaderProps {
  lessonId: string;
  currentStatus?: string | null;
  onUploadComplete?: () => void;
}

interface UploadData {
  uploadId: string;
  uploadUrl: string;
  videoAssetId: string;
}

type UploadState = "idle" | "requesting" | "uploading" | "processing" | "done" | "error";

export function VideoUploader({ lessonId, currentStatus, onUploadComplete }: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>(() => {
    if (currentStatus === "READY") return "done";
    if (currentStatus === "PREPARING") return "processing";
    return "idle";
  });
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("video/")) {
      setErrorMsg("Please select a video file (MP4, MOV, MKV…)");
      setState("error");
      return;
    }

    setState("requesting");
    setErrorMsg(null);
    setProgress(0);

    try {
      const { data } = await fetchApiJson<{ data: UploadData }>("/videos/upload", {
        method: "POST",
        auth: "required",
        body: JSON.stringify({ lessonId }),
      });

      setState("uploading");

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", data.uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };

        xhr.onload = () =>
          xhr.status < 400 ? resolve() : reject(new Error(`Upload failed (HTTP ${xhr.status})`));
        xhr.onerror = () => reject(new Error("Network error — check your connection and try again"));
        xhr.send(file);
      });

      setState("processing");
      setProgress(100);
      onUploadComplete?.();
    } catch (err: unknown) {
      setState("error");
      const msg = err instanceof Error ? err.message : "Upload failed";
      setErrorMsg(msg);
    }
  }, [lessonId, onUploadComplete]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  }, [handleFile]);

  const reset = () => {
    setState("idle");
    setErrorMsg(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  if (state === "idle" || state === "error") {
    return (
      <div className="space-y-3">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-all ${
            dragging
              ? "border-[var(--brand)] bg-[var(--brand)]/8"
              : state === "error"
              ? "border-red-500/40 hover:border-red-500/60"
              : "border-[var(--surface-3)] hover:border-[var(--brand)]/50 hover:bg-[var(--brand)]/5"
          }`}
        >
          <div className={`rounded-full p-3 ${state === "error" ? "bg-red-500/10" : "bg-[var(--surface-2)]"}`}>
            {state === "error"
              ? <AlertCircle size={22} className="text-red-400" />
              : <UploadCloud size={22} className="text-[var(--text-3)]" />
            }
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-[var(--text-1)]">
              {dragging ? "Drop to upload" : "Drag & drop or click to select"}
            </p>
            <p className="mt-0.5 text-xs text-[var(--text-3)]">MP4, MOV, MKV — up to 10 GB</p>
          </div>
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400 max-w-sm text-center">
              {errorMsg}
            </div>
          )}
        </div>
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
    );
  }

  if (state === "requesting") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)] p-4">
        <Loader2 size={18} className="animate-spin text-[var(--brand)]" />
        <div>
          <p className="text-sm font-medium text-[var(--text-1)]">Preparing upload…</p>
          <p className="text-xs text-[var(--text-3)]">Getting upload URL from server</p>
        </div>
      </div>
    );
  }

  if (state === "uploading") {
    return (
      <div className="space-y-3 rounded-xl border border-[var(--surface-2)] bg-[var(--surface-1)] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Loader2 size={14} className="animate-spin text-[var(--brand)]" />
            <p className="text-sm font-medium text-[var(--text-1)]">Uploading video…</p>
          </div>
          <span className="tabular-nums text-sm font-semibold text-[var(--brand)]">{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-3)]">
          <div
            className="h-full rounded-full bg-[var(--brand)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-[var(--text-3)]">Don't close this tab while uploading</p>
      </div>
    );
  }

  if (state === "processing") {
    return (
      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
        <div className="flex items-start gap-3">
          <Loader2 size={18} className="mt-0.5 animate-spin text-yellow-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-[var(--text-1)]">Processing your video</p>
            <p className="mt-0.5 text-xs text-[var(--text-3)]">
              Mux is transcoding your video. This can take a few minutes. You can leave this page — the status will update automatically.
            </p>
          </div>
        </div>
        <button
          onClick={reset}
          className="mt-3 flex items-center gap-1.5 text-xs text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors"
        >
          <RefreshCw size={11} />
          Upload a different file
        </button>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={18} className="text-green-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-[var(--text-1)]">Video is ready</p>
            <p className="mt-0.5 text-xs text-[var(--text-3)]">Transcoding complete — playback is available</p>
          </div>
        </div>
        <button
          onClick={reset}
          className="mt-3 flex items-center gap-1.5 text-xs text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors"
        >
          <RefreshCw size={11} />
          Replace video
        </button>
      </div>
    );
  }

  return null;
}
