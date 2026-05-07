import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import type { BillingService } from "./billing.service.js";
import { env } from "../../shared/config/env.js";

const createCheckoutSchema = z.object({
  body: z.object({
    planId: z.string().min(1),
  }),
});

export class BillingController {
  constructor(private readonly service: BillingService) {}

  getPlans = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const plans = await this.service.getActivePlans();
      res.json({ data: plans });
    } catch (err) {
      next(err);
    }
  };

  createCheckout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { body } = createCheckoutSchema.parse({ body: req.body });
      const userId = req.user!.id;

      const session = await this.service.createCheckoutSession({
        userId,
        planId: body.planId,
        successUrl: `${env.WEB_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${env.WEB_URL}/pricing`,
      });

      res.json({ data: session });
    } catch (err) {
      next(err);
    }
  };

  createPortalSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.createPortalSession(req.user!.id);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  };

  getSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const subscription = await this.service.getUserSubscription(req.user!.id);
      res.json({ data: subscription });
    } catch (err) {
      next(err);
    }
  };

  getPaymentHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payments = await this.service.getPaymentHistory(req.user!.id);
      res.json({ data: payments });
    } catch (err) {
      next(err);
    }
  };

  // Webhook — recibe body crudo (Buffer), no JSON parseado
  handleWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const signature = req.headers["stripe-signature"];
      if (!signature || typeof signature !== "string") {
        res.status(400).json({ error: { code: "MISSING_SIGNATURE", message: "Missing Stripe signature" } });
        return;
      }

      await this.service.handleWebhook(req.body as Buffer, signature);
      res.json({ received: true });
    } catch (err) {
      next(err);
    }
  };
}
