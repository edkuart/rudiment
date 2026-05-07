import { Router } from "express";
import { db } from "../../shared/db/index.js";
import { CoursesRepository } from "./courses.repository.js";
import { CoursesService } from "./courses.service.js";
import { CoursesController } from "./courses.controller.js";
import { entitlementsService } from "../entitlements/index.js";
import { requireAuth, requireRole } from "../../shared/middleware/require-auth.js";
import { validateRequest } from "../../shared/middleware/validate-request.js";
import {
  createCourseSchema,
  updateCourseSchema,
  createLessonSchema,
  updateLessonSchema,
  reorderLessonsSchema,
  coursesFilterSchema,
} from "./courses.schema.js";

const repo = new CoursesRepository(db);
const service = new CoursesService(repo, entitlementsService);
const ctrl = new CoursesController(service);

export const coursesRouter = Router();

// ─── Tags (public) ───────────────────────────────────────────────────────────
coursesRouter.get("/tags", ctrl.getAllTags);

// ─── Courses (public read) ───────────────────────────────────────────────────
coursesRouter.get("/", validateRequest(coursesFilterSchema), ctrl.listCourses);
coursesRouter.get("/slug/:slug", ctrl.getCourseBySlug);

// ─── Courses (admin write) ───────────────────────────────────────────────────
coursesRouter.get("/:id", requireAuth, requireRole("ADMIN"), ctrl.getCourseById);
coursesRouter.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  validateRequest(createCourseSchema),
  ctrl.createCourse,
);
coursesRouter.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validateRequest(updateCourseSchema),
  ctrl.updateCourse,
);
coursesRouter.delete("/:id", requireAuth, requireRole("ADMIN"), ctrl.deleteCourse);

// ─── Sections (admin) ────────────────────────────────────────────────────────
coursesRouter.post("/:id/sections", requireAuth, requireRole("ADMIN"), ctrl.createSection);

// ─── Lessons ─────────────────────────────────────────────────────────────────
// GET /courses/lessons/by-slug?courseSlug=xxx&lessonSlug=yyy
coursesRouter.get("/lessons/by-slug", ctrl.getLessonBySlug);

coursesRouter.post(
  "/:id/lessons",
  requireAuth,
  requireRole("ADMIN"),
  validateRequest(createLessonSchema),
  ctrl.createLesson,
);
coursesRouter.patch(
  "/:id/lessons/reorder",
  requireAuth,
  requireRole("ADMIN"),
  validateRequest(reorderLessonsSchema),
  ctrl.reorderLessons,
);
coursesRouter.get("/lessons/:lessonId", requireAuth, ctrl.getLessonById);
coursesRouter.patch(
  "/lessons/:lessonId",
  requireAuth,
  requireRole("ADMIN"),
  validateRequest(updateLessonSchema),
  ctrl.updateLesson,
);
coursesRouter.delete("/lessons/:lessonId", requireAuth, requireRole("ADMIN"), ctrl.deleteLesson);
