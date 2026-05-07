import jwt from "jsonwebtoken";
import { mux } from "./video.client.js";
import { eventBus } from "../../shared/events/event-bus.js";
import { logger } from "../../shared/utils/logger.js";
import { env } from "../../shared/config/env.js";
import { AppError, NotFoundError } from "../../shared/middleware/error-handler.js";
import type { VideoRepository } from "./video.repository.js";
import type { DirectUploadResult, PlaybackTokenResult } from "./video.types.js";

const PLAYBACK_TOKEN_TTL = 3600; // 1 hour in seconds

export class VideoService {
  constructor(private readonly repo: VideoRepository) {}

  // ─── Direct upload ────────────────────────────────────────────────────────

  async createDirectUpload(lessonId: string): Promise<DirectUploadResult> {
    const upload = await mux.video.uploads.create({
      cors_origin: env.WEB_URL,
      new_asset_settings: {
        playback_policy: ["signed"],
        encoding_tier: "smart",
      },
    });

    const videoAsset = await this.repo.upsertForLesson(lessonId, {
      muxUploadId: upload.id,
    });

    logger.info({ lessonId, muxUploadId: upload.id }, "Mux direct upload created");

    if (!upload.url) throw new AppError(500, "MUX_ERROR", "Mux did not return an upload URL");

    return {
      uploadId: upload.id,
      uploadUrl: upload.url,
      videoAssetId: videoAsset.id,
    };
  }

  // ─── Signed playback token ────────────────────────────────────────────────

  async getPlaybackToken(lessonId: string): Promise<PlaybackTokenResult> {
    const asset = await this.repo.findByLessonId(lessonId);

    if (!asset) throw new NotFoundError("Video asset");
    if (asset.status !== "READY") {
      throw new AppError(409, "VIDEO_NOT_READY", "Video is not ready for playback yet");
    }
    if (!asset.muxPlaybackId) {
      throw new AppError(500, "MISSING_PLAYBACK_ID", "Playback ID not set");
    }

    if (!env.MUX_SIGNING_KEY_ID || !env.MUX_SIGNING_PRIVATE_KEY) {
      throw new AppError(500, "CONFIG_ERROR", "Mux signing keys not configured");
    }

    const privateKey = Buffer.from(env.MUX_SIGNING_PRIVATE_KEY, "base64");
    const exp = Math.floor(Date.now() / 1000) + PLAYBACK_TOKEN_TTL;

    // Mux signed tokens use RS256 with the signing key pair.
    const token = jwt.sign(
      { sub: asset.muxPlaybackId, aud: "v", exp },
      privateKey,
      { algorithm: "RS256", keyid: env.MUX_SIGNING_KEY_ID },
    );

    return { playbackId: asset.muxPlaybackId, token, expiresIn: PLAYBACK_TOKEN_TTL };
  }

  // ─── Mux webhook handler ──────────────────────────────────────────────────

  async handleMuxWebhook(rawBody: string, muxSignature: string): Promise<void> {
    if (!env.MUX_WEBHOOK_SECRET) {
      throw new AppError(500, "CONFIG_ERROR", "MUX_WEBHOOK_SECRET not configured");
    }

    // Verify signature using Mux SDK
    try {
      mux.webhooks.verifySignature(rawBody, { "mux-signature": muxSignature }, env.MUX_WEBHOOK_SECRET);
    } catch {
      throw new AppError(400, "INVALID_WEBHOOK", "Mux webhook signature verification failed");
    }

    const event = JSON.parse(rawBody) as MuxWebhookEvent;
    logger.info({ type: event.type, id: event.id }, "Mux webhook received");

    switch (event.type) {
      case "video.upload.asset_created":
        await this.onUploadAssetCreated(event.data);
        break;
      case "video.asset.ready":
        await this.onAssetReady(event.data);
        break;
      case "video.asset.errored":
        await this.onAssetErrored(event.data);
        break;
      default:
        logger.debug({ type: event.type }, "Unhandled Mux event");
    }
  }

  // ─── Internal handlers ────────────────────────────────────────────────────

  private async onUploadAssetCreated(data: MuxEventData): Promise<void> {
    const uploadId = data.upload_id;
    if (!uploadId) return;

    await this.repo.updateByMuxUploadId(uploadId, {
      muxAssetId: data.id,
      status: "PREPARING",
    });

    logger.info({ muxAssetId: data.id, uploadId }, "Asset created from upload");
  }

  private async onAssetReady(data: MuxEventData): Promise<void> {
    const playback = data.playback_ids?.[0];
    const playbackId = playback?.id;

    const update: Parameters<typeof this.repo.updateByMuxAssetId>[1] = {
      status: "READY",
      processedAt: new Date(),
    };
    if (playbackId) {
      update.muxPlaybackId = playbackId;
      update.thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
      update.animatedThumbnailUrl = `https://image.mux.com/${playbackId}/animated.gif`;
    }
    if (data.duration) update.duration = Math.round(data.duration);
    if (data.aspect_ratio) update.aspectRatio = data.aspect_ratio;
    if (data.max_resolution_tier) update.resolution = data.max_resolution_tier;

    await this.repo.updateByMuxAssetId(data.id, update);

    // Find the lesson this asset belongs to and emit the event bus signal.
    const asset = await this.repo.findByMuxAssetId(data.id);
    if (asset && playbackId) {
      eventBus.emit("video.asset.ready", {
        lessonId: asset.lessonId,
        muxAssetId: data.id,
        muxPlaybackId: playbackId,
      });
    }

    logger.info({ muxAssetId: data.id, playbackId }, "Video asset ready");
  }

  private async onAssetErrored(data: MuxEventData): Promise<void> {
    await this.repo.updateByMuxAssetId(data.id, {
      status: "ERRORED",
      errorMessage: data.errors?.messages?.[0] ?? "Unknown error",
    });

    const asset = await this.repo.findByMuxAssetId(data.id);
    if (asset) {
      eventBus.emit("video.asset.errored", {
        lessonId: asset.lessonId,
        muxAssetId: data.id,
      });
    }

    logger.error({ muxAssetId: data.id }, "Video asset errored");
  }
}

// ─── Mux webhook payload types ────────────────────────────────────────────────

interface MuxEventData {
  id: string;
  upload_id?: string;
  playback_ids?: Array<{ id: string; policy: string }>;
  duration?: number;
  aspect_ratio?: string;
  max_resolution_tier?: string;
  errors?: { messages?: string[] };
}

interface MuxWebhookEvent {
  type: string;
  id: string;
  data: MuxEventData;
}
