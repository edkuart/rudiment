import { pgTable, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { lessons } from "./courses.js";

export const videoAssetStatusEnum = pgEnum("video_asset_status", [
  "WAITING",
  "PREPARING",
  "READY",
  "ERRORED",
]);

export const videoAssets = pgTable("video_assets", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  lessonId: text("lesson_id")
    .notNull()
    .unique()
    .references(() => lessons.id, { onDelete: "cascade" }),
  muxAssetId: text("mux_asset_id").unique(),
  muxPlaybackId: text("mux_playback_id").unique(),
  muxUploadId: text("mux_upload_id").unique(), // ID del Direct Upload en curso
  status: videoAssetStatusEnum("status").notNull().default("WAITING"),
  duration: integer("duration"), // segundos
  aspectRatio: text("aspect_ratio"), // "16:9"
  resolution: text("resolution"), // "1080p"
  thumbnailUrl: text("thumbnail_url"),
  animatedThumbnailUrl: text("animated_thumbnail_url"),
  errorMessage: text("error_message"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
