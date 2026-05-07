"use client";

import { useCallback, useRef } from "react";
import { fetchApi } from "@/lib/api-fetch";
const HEARTBEAT_INTERVAL_MS = 15_000; // report every 15s

interface Options {
  lessonId: string;
  courseId: string;
}

export function useProgressReporter({ lessonId, courseId }: Options) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const positionRef = useRef(0);
  const totalRef = useRef(0);

  const sendHeartbeat = useCallback(async () => {
    if (totalRef.current === 0) return;
    try {
      await fetchApi("/progress/heartbeat", {
        method: "POST",
        auth: "required",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          courseId,
          positionSeconds: Math.round(positionRef.current),
          totalSeconds: Math.round(totalRef.current),
        }),
      });
    } catch {
      // silent — never block playback
    }
  }, [lessonId, courseId]);

  const onTimeUpdate = useCallback(
    (currentTime: number, duration: number) => {
      positionRef.current = currentTime;
      totalRef.current = duration;
    },
    [],
  );

  const start = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => { void sendHeartbeat(); }, HEARTBEAT_INTERVAL_MS);
  }, [sendHeartbeat]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    void sendHeartbeat(); // final flush
  }, [sendHeartbeat]);

  return { onTimeUpdate, start, stop };
}
