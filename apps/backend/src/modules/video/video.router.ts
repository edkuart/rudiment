import { Router } from "express";
import express from "express";
import { db } from "../../shared/db/index.js";
import { VideoRepository } from "./video.repository.js";
import { VideoService } from "./video.service.js";
import { VideoController } from "./video.controller.js";
import { requireAuth, requireRole } from "../../shared/middleware/require-auth.js";

const repo = new VideoRepository(db);
const service = new VideoService(repo);
const ctrl = new VideoController(service);

export const videoRouter = Router();

// Admin: create a direct upload URL for a lesson
videoRouter.post("/upload", requireAuth, requireRole("ADMIN"), ctrl.createUpload);

// Authenticated users: get a signed playback token for a lesson's video
videoRouter.get("/:lessonId/playback-token", requireAuth, ctrl.getPlaybackToken);

// Mux webhook — raw body required for signature verification
export const muxWebhookRouter = Router();
muxWebhookRouter.post(
  "/",
  express.raw({ type: "application/json" }),
  ctrl.handleMuxWebhook,
);
