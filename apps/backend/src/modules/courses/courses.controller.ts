import type { Request, Response, NextFunction } from "express";
import type { CoursesService } from "./courses.service.js";
import type { CoursesFilter } from "./courses.types.js";

export class CoursesController {
  constructor(private readonly service: CoursesService) {}

  // ─── Courses ─────────────────────────────────────────────────────────────

  listCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter = req.query as unknown as CoursesFilter;
      const result = await this.service.listCourses(filter);
      res.json({ data: result.rows, meta: { total: result.total } });
    } catch (err) {
      next(err);
    }
  };

  getCourseBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.params as { slug: string };
      const userId = req.user?.id;
      const course = await this.service.getCourseBySlug(slug, userId);
      res.json({ data: course });
    } catch (err) {
      next(err);
    }
  };

  getCourseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const course = await this.service.getCourseById(id);
      res.json({ data: course });
    } catch (err) {
      next(err);
    }
  };

  createCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const course = await this.service.createCourse(req.body);
      res.status(201).json({ data: course });
    } catch (err) {
      next(err);
    }
  };

  updateCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const course = await this.service.updateCourse(id, req.body);
      res.json({ data: course });
    } catch (err) {
      next(err);
    }
  };

  deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      await this.service.deleteCourse(id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  };

  // ─── Lessons ─────────────────────────────────────────────────────────────

  getLessonBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseSlug, lessonSlug } = req.query as { courseSlug: string; lessonSlug: string };
      const userId = req.user?.id;
      const lesson = await this.service.getLessonsBySlugAndCourse(lessonSlug, courseSlug, userId);
      res.json({ data: lesson });
    } catch (err) {
      next(err);
    }
  };

  getLessonById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lessonId } = req.params as { lessonId: string };
      const userId = req.user?.id;
      const lesson = await this.service.getLessonById(lessonId, userId);
      res.json({ data: lesson });
    } catch (err) {
      next(err);
    }
  };

  createLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const lesson = await this.service.createLesson(id, req.body);
      res.status(201).json({ data: lesson });
    } catch (err) {
      next(err);
    }
  };

  updateLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lessonId } = req.params as { lessonId: string };
      const lesson = await this.service.updateLesson(lessonId, req.body);
      res.json({ data: lesson });
    } catch (err) {
      next(err);
    }
  };

  deleteLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lessonId } = req.params as { lessonId: string };
      await this.service.deleteLesson(lessonId);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  };

  reorderLessons = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      await this.service.reorderLessons(id, req.body.lessons);
      res.json({ data: { ok: true } });
    } catch (err) {
      next(err);
    }
  };

  // ─── Sections ────────────────────────────────────────────────────────────

  createSection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const { title, position } = req.body as { title: string; position?: number };
      const section = await this.service.createSection(id, title, position);
      res.status(201).json({ data: section });
    } catch (err) {
      next(err);
    }
  };

  // ─── Tags ────────────────────────────────────────────────────────────────

  getAllTags = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const tags = await this.service.getAllTags();
      res.json({ data: tags });
    } catch (err) {
      next(err);
    }
  };
}
