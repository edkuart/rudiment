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

  listUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string ?? "1", 10));
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string ?? "20", 10)));
      const roleRaw = (req.query.role as string) || "";
      const searchRaw = (req.query.search as string) || "";
      const result = await this.repo.listUsers({
        page,
        limit,
        ...(roleRaw ? { role: roleRaw } : {}),
        ...(searchRaw ? { search: searchRaw } : {}),
      });
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  };
}
