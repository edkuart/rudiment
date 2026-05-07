import { eq } from "drizzle-orm";
import type { Db } from "../../shared/db/index.js";
import { videoAssets } from "../../shared/db/schema/index.js";
import type { VideoAssetStatus } from "./video.types.js";

export class VideoRepository {
  constructor(private readonly db: Db) {}

  async findByLessonId(lessonId: string) {
    return this.db.query.videoAssets.findFirst({
      where: eq(videoAssets.lessonId, lessonId),
    });
  }

  async findByMuxUploadId(muxUploadId: string) {
    return this.db.query.videoAssets.findFirst({
      where: eq(videoAssets.muxUploadId, muxUploadId),
    });
  }

  async findByMuxAssetId(muxAssetId: string) {
    return this.db.query.videoAssets.findFirst({
      where: eq(videoAssets.muxAssetId, muxAssetId),
    });
  }

  async upsertForLesson(lessonId: string, data: { muxUploadId: string }): Promise<VideoAsset> {
    const [row] = await this.db
      .insert(videoAssets)
      .values({ lessonId, muxUploadId: data.muxUploadId, status: "WAITING" })
      .onConflictDoUpdate({
        target: videoAssets.lessonId,
        set: { muxUploadId: data.muxUploadId, status: "WAITING", updatedAt: new Date() },
      })
      .returning();
    if (!row) throw new Error("Failed to upsert video asset");
    return row;
  }

  async updateByMuxUploadId(
    muxUploadId: string,
    data: { muxAssetId: string; status: VideoAssetStatus },
  ) {
    await this.db
      .update(videoAssets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(videoAssets.muxUploadId, muxUploadId));
  }

  async updateByMuxAssetId(
    muxAssetId: string,
    data: Partial<{
      muxPlaybackId: string;
      status: VideoAssetStatus;
      duration: number;
      aspectRatio: string;
      resolution: string;
      thumbnailUrl: string;
      animatedThumbnailUrl: string;
      errorMessage: string;
      processedAt: Date;
    }>,
  ) {
    await this.db
      .update(videoAssets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(videoAssets.muxAssetId, muxAssetId));
  }
}

type VideoAsset = typeof videoAssets.$inferSelect;
