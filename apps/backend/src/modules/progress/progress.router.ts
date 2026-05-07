import { Router } from "express";
import { db } from "../../shared/db/index.js";
import { ProgressRepository } from "./progress.repository.js";
import { ProgressService } from "./progress.service.js";
import { ProgressController } from "./progress.controller.js";
import { requireAuth } from "../../shared/middleware/require-auth.js";
import { validateRequest } from "../../shared/middleware/validate-request.js";
import { heartbeatSchema, completeLessonSchema, bookmarkSchema } from "./progress.schema.js";

const repo = new ProgressRepository(db);
const service = new ProgressService(repo);
const ctrl = new ProgressController(service);

export const progressRouter = Router();

// All progress routes require authentication
progressRouter.use(requireAuth);

// Student stats — GET /progress/stats
progressRouter.get("/stats", ctrl.getStudentStats);

// Heartbeat — POST /progress/heartbeat
progressRouter.post("/heartbeat", validateRequest(heartbeatSchema), ctrl.heartbeat);

// Complete lesson — POST /progress/lessons/:lessonId/complete
progressRouter.post(
  "/lessons/:lessonId/complete",
  validateRequest(completeLessonSchema),
  ctrl.completeLesson,
);

// Course progress — GET /progress/courses/:courseId
progressRouter.get("/courses/:courseId", ctrl.getCourseProgress);

// Resume position — GET /progress/lessons/:lessonId/resume
progressRouter.get("/lessons/:lessonId/resume", ctrl.getResumePosition);

// Continue watching — GET /progress/continue-watching
progressRouter.get("/continue-watching", ctrl.getContinueWatching);

// Bookmarks — POST /progress/bookmarks (toggle)
progressRouter.post("/bookmarks", validateRequest(bookmarkSchema), ctrl.toggleBookmark);

// Bookmarks — GET /progress/bookmarks
progressRouter.get("/bookmarks", ctrl.getUserBookmarks);
