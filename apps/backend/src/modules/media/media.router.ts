import { Router } from "express";
import { db } from "../../shared/db/index.js";
import { MediaRepository } from "./media.repository.js";
import { MediaService } from "./media.service.js";
import { MediaController } from "./media.controller.js";
import { requireAuth, requireRole } from "../../shared/middleware/require-auth.js";
import { validateRequest } from "../../shared/middleware/validate-request.js";
import { createMediaSchema } from "./media.schema.js";

const repo = new MediaRepository(db);
const service = new MediaService(repo);
const ctrl = new MediaController(service);

export const mediaRouter = Router();

// Admin — create presigned upload URL
mediaRouter.post(
  "/upload-url",
  requireAuth,
  requireRole("ADMIN"),
  validateRequest(createMediaSchema),
  ctrl.createUploadUrl,
);

// Admin — delete file
mediaRouter.delete("/:id", requireAuth, requireRole("ADMIN"), ctrl.deleteFile);

// Authenticated users — get download URL
mediaRouter.get("/:id/download-url", requireAuth, ctrl.getDownloadUrl);

// List by lesson or course (authenticated)
mediaRouter.get("/lessons/:lessonId", requireAuth, ctrl.listByLesson);
mediaRouter.get("/courses/:courseId", requireAuth, ctrl.listByCourse);
