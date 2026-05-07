import type { Request, Response, NextFunction } from "express";
import type { MediaService } from "./media.service.js";

export class MediaController {
  constructor(private readonly service: MediaService) {}

  createUploadUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.createUploadUrl(req.body);
      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  };

  getDownloadUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const result = await this.service.getDownloadUrl(id, req.user?.id);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  };

  listByLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lessonId } = req.params as { lessonId: string };
      const files = await this.service.listByLesson(lessonId);
      res.json({ data: files });
    } catch (err) {
      next(err);
    }
  };

  listByCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params as { courseId: string };
      const files = await this.service.listByCourse(courseId);
      res.json({ data: files });
    } catch (err) {
      next(err);
    }
  };

  deleteFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      await this.service.deleteFile(id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  };
}
