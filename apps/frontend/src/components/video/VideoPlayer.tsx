"use client";

import MuxPlayer from "@mux/mux-player-react";
import { useEffect, useState } from "react";
import { useProgressReporter } from "@/hooks/useProgressReporter";
import { fetchApiData } from "@/lib/api-fetch";

interface VideoPlayerProps {
  lessonId: string;
  courseId: string;
  title?: string;
  onEnded?: () => void;
}

interface PlaybackData {
  playbackId: string;
  token: string;
}

export function VideoPlayer({ lessonId, courseId, title, onEnded }: VideoPlayerProps) {
  const [playback, setPlayback] = useState<PlaybackData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { onTimeUpdate, start, stop } = useProgressReporter({ lessonId, courseId });

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchApiData<PlaybackData>(`/videos/${lessonId}/playback-token`, { auth: "required" })
      .then((data) => setPlayback(data))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [lessonId]);

  if (loading) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-[var(--surface-1)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--brand)] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl bg-[var(--surface-1)] text-center">
        <span className="text-2xl">⚠️</span>
        <p className="text-sm text-[var(--text-2)]">{error}</p>
      </div>
    );
  }

  if (!playback) return null;

  return (
    <div className="overflow-hidden rounded-xl bg-black">
      <MuxPlayer
        playbackId={playback.playbackId}
        tokens={{ playback: playback.token }}
        metadata={{ video_title: title }}
        streamType="on-demand"
        className="aspect-video w-full"
        accentColor="var(--brand)"
        onPlay={start}
        onPause={stop}
        onEnded={() => { stop(); onEnded?.(); }}
        onTimeUpdate={(e) => {
          const target = e.target as HTMLVideoElement;
          onTimeUpdate(target.currentTime, target.duration ?? 0);
        }}
      />
    </div>
  );
}
