import { Router } from "express";
import { db } from "../../shared/db/index.js";
import { AnalyticsRepository } from "./analytics.repository.js";
import { AnalyticsController } from "./analytics.controller.js";
import { requireAuth, requireRole } from "../../shared/middleware/require-auth.js";

const repo = new AnalyticsRepository(db);
const ctrl = new AnalyticsController(repo);

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth, requireRole("ADMIN"));

analyticsRouter.get("/overview", ctrl.getOverview);
analyticsRouter.get("/top-courses", ctrl.getTopCourses);
analyticsRouter.get("/recent-signups", ctrl.getRecentSignups);
