import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { db } from "../../shared/db/index.js";
import { requireAuth } from "../../shared/middleware/require-auth.js";
import { AuthRepository } from "./auth.repository.js";
import { AuthService } from "./auth.service.js";
import { AuthController } from "./auth.controller.js";

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10,
  message: { error: { code: "RATE_LIMIT", message: "Too many attempts, try again later" } },
  skipSuccessfulRequests: true,
});

const repo = new AuthRepository(db);
const service = new AuthService(repo);
const controller = new AuthController(service);

const router = Router();

router.post("/register", authLimiter, controller.register);
router.post("/login", authLimiter, controller.login);
router.post("/refresh", controller.refresh);
router.post("/logout", controller.logout);
router.post("/logout-all", requireAuth, controller.logoutAll);
router.get("/me", requireAuth, controller.me);
router.get("/me/profile", requireAuth, controller.getProfile);
router.patch("/me/profile", requireAuth, controller.updateProfile);

export { router as authRouter, service as authService };
