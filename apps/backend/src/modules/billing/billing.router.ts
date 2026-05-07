import { Router } from "express";
import express from "express";
import { db } from "../../shared/db/index.js";
import { requireAuth } from "../../shared/middleware/require-auth.js";
import { BillingRepository } from "./billing.repository.js";
import { BillingService } from "./billing.service.js";
import { BillingController } from "./billing.controller.js";

const repo = new BillingRepository(db);
export const billingService = new BillingService(repo);
const controller = new BillingController(billingService);

const router = Router();

// Público — listado de planes
router.get("/plans", controller.getPlans);

// Webhook — body crudo como Buffer para verificación de firma
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  controller.handleWebhook,
);

// Rutas autenticadas
router.post("/checkout", requireAuth, controller.createCheckout);
router.post("/portal", requireAuth, controller.createPortalSession);
router.get("/subscription", requireAuth, controller.getSubscription);
router.get("/payments", requireAuth, controller.getPaymentHistory);

export { router as billingRouter };
