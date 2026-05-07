import type { Request, Response, NextFunction } from "express";
import type { AnalyticsRepository } from "./analytics.repository.js";

export class AnalyticsController {
  constructor(private readonly repo: AnalyticsRepository) {}

  getOverview = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const overview = await this.repo.getAdminOverview();
      res.json({ data: overview });
    } catch (err) {
      next(err);
    }
  };

  getTopCourses = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const courses = await this.repo.getTopCoursesByProgress(5);
      res.json({ data: courses });
    } catch (err) {
      next(err);
    }
  };

  getRecentSignups = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.repo.getRecentSignups(10);
      res.json({ data: users });
    } catch (err) {
      next(err);
    }
  };
}
