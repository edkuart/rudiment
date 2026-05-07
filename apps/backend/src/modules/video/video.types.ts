import type { videoAssets } from "../../shared/db/schema/index.js";

export type VideoAsset = typeof videoAssets.$inferSelect;

export type VideoAssetStatus = "WAITING" | "PREPARING" | "READY" | "ERRORED";

export interface DirectUploadResult {
  uploadId: string;   // Mux upload ID
  uploadUrl: string;  // URL to PUT the video file directly to Mux
  videoAssetId: string; // Our internal video_assets record ID
}

export interface PlaybackTokenResult {
  playbackId: string;
  token: string;    // Signed JWT for private playback
  expiresIn: number; // seconds
}
