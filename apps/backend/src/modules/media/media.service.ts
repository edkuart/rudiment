import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createId } from "@paralleldrive/cuid2";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "./r2.client.js";
import { logger } from "../../shared/utils/logger.js";
import { AppError, NotFoundError } from "../../shared/middleware/error-handler.js";
import type { MediaRepository } from "./media.repository.js";
import type { CreateMediaInput, UploadPresignResult, DownloadPresignResult } from "./media.types.js";

const UPLOAD_TTL = 300;   // 5 min
const DOWNLOAD_TTL = 3600; // 1 hour

export class MediaService {
  constructor(private readonly repo: MediaRepository) {}

  async createUploadUrl(input: CreateMediaInput): Promise<UploadPresignResult> {
    if (!R2_BUCKET) throw new AppError(500, "CONFIG_ERROR", "R2 not configured");

    const ext = input.filename.split(".").pop() ?? "bin";
    const prefix = input.lessonId ? `media/lessons/${input.lessonId}` : `media/courses/${input.courseId ?? "shared"}`;
    const storageKey = `${prefix}/${createId()}.${ext}`;

    const mediaFile = await this.repo.create({ ...input, storageKey });

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: storageKey,
      ContentType: input.mimeType,
      ContentLength: input.sizeBytes,
    });

    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: UPLOAD_TTL });

    logger.info({ mediaFileId: mediaFile.id, storageKey }, "R2 presigned upload URL created");

    return { mediaFileId: mediaFile.id, uploadUrl, storageKey, expiresIn: UPLOAD_TTL };
  }

  async getDownloadUrl(id: string, userId?: string): Promise<DownloadPresignResult> {
    const file = await this.repo.findById(id);
    if (!file) throw new NotFoundError("Media file");

    if (file.isPublic && R2_PUBLIC_URL) {
      return { downloadUrl: `${R2_PUBLIC_URL}/${file.storageKey}`, expiresIn: 0 };
    }

    if (!R2_BUCKET) throw new AppError(500, "CONFIG_ERROR", "R2 not configured");

    const command = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: file.storageKey,
      ResponseContentDisposition: `attachment; filename="${file.filename}"`,
    });

    const downloadUrl = await getSignedUrl(r2, command, { expiresIn: DOWNLOAD_TTL });

    return { downloadUrl, expiresIn: DOWNLOAD_TTL };
  }

  async listByLesson(lessonId: string) {
    return this.repo.findByLesson(lessonId);
  }

  async listByCourse(courseId: string) {
    return this.repo.findByCourse(courseId);
  }

  async deleteFile(id: string): Promise<void> {
    const file = await this.repo.findById(id);
    if (!file) throw new NotFoundError("Media file");

    if (R2_BUCKET) {
      try {
        await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: file.storageKey }));
      } catch (err) {
        logger.warn({ err, storageKey: file.storageKey }, "Failed to delete R2 object, soft-deleting anyway");
      }
    }

    await this.repo.softDelete(id);
    logger.info({ id, storageKey: file.storageKey }, "Media file deleted");
  }
}
