import type { Request, Response, NextFunction } from "express";
import type { ProgressService } from "./progress.service.js";
import { AppError } from "../../shared/middleware/error-handler.js";

export class ProgressController {
  constructor(private readonly service: ProgressService) {}

  getStudentStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const stats = await this.service.getStudentStats(userId);
      res.json({ data: stats });
    } catch (err) {
      next(err);
    }
  };

  heartbeat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { lessonId, courseId, positionSeconds, totalSeconds } = req.body as {
        lessonId: string;
        courseId: string;
        positionSeconds: number;
        totalSeconds: number;
      };
      await this.service.updateProgress(userId, lessonId, courseId, positionSeconds, totalSeconds);
      res.json({ data: { ok: true } });
    } catch (err) {
      next(err);
    }
  };

  completeLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { lessonId } = req.params as { lessonId: string };
      const { courseId } = req.body as { courseId: string };
      await this.service.completeLesson(userId, lessonId, courseId);
      res.json({ data: { ok: true } });
    } catch (err) {
      next(err);
    }
  };

  getCourseProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { courseId } = req.params as { courseId: string };
      const progress = await this.service.getCourseProgress(userId, courseId);
      res.json({ data: progress });
    } catch (err) {
      next(err);
    }
  };

  getResumePosition = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { lessonId } = req.params as { lessonId: string };
      const position = await this.service.getResumePosition(userId, lessonId);
      res.json({ data: { positionSeconds: position } });
    } catch (err) {
      next(err);
    }
  };

  getContinueWatching = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const limit = Math.min(Number(req.query["limit"] ?? 5), 20);
      const items = await this.service.getContinueWatching(userId, limit);
      res.json({ data: items });
    } catch (err) {
      next(err);
    }
  };

  toggleBookmark = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { resourceType, resourceId } = req.body as {
        resourceType: string;
        resourceId: string;
      };
      const result = await this.service.toggleBookmark(userId, resourceType, resourceId);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  };

  getUserBookmarks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const resourceType = req.query["type"] as string | undefined;
      const items = await this.service.getUserBookmarks(userId, resourceType);
      res.json({ data: items });
    } catch (err) {
      next(err);
    }
  };
}
