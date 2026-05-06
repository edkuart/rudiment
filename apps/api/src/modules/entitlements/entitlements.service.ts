import { logger } from "../../shared/utils/logger.js";
import { eventBus } from "../../shared/events/event-bus.js";
import type { EntitlementsRepository } from "./entitlements.repository.js";

export class EntitlementsService {
  constructor(private readonly repo: EntitlementsRepository) {}

  // ─── Check de acceso — usado por todos los módulos de contenido ──────────

  async hasAccess(
    userId: string,
    resourceType: "PLAN" | "COURSE" | "BUNDLE",
    resourceId: string,
  ): Promise<boolean> {
    // Un acceso de PLAN cubre cualquier recurso de suscripción
    if (resourceType !== "PLAN") {
      const planEntitlement = await this.repo.findActivePlanEntitlement(userId);
      if (planEntitlement) return true;
    }

    const entitlement = await this.repo.findActiveEntitlement(
      userId,
      resourceType,
      resourceId,
    );
    return entitlement !== undefined;
  }

  async hasPlanAccess(userId: string): Promise<boolean> {
    const entitlement = await this.repo.findActivePlanEntitlement(userId);
    return entitlement !== undefined;
  }

  // ─── Grant/Revoke — llamados desde eventos de billing ───────────────────

  async grantPlanAccess(
    userId: string,
    planId: string,
    subscriptionId: string,
    validUntil?: Date | undefined,
  ): Promise<void> {
    await this.repo.createEntitlement({
      userId,
      resourceType: "PLAN",
      resourceId: planId,
      source: "SUBSCRIPTION",
      referenceId: subscriptionId,
      validUntil,
    });

    logger.info({ userId, planId, subscriptionId }, "Plan entitlement granted");
  }

  async grantLifetimeAccess(userId: string, planId: string, paymentId: string): Promise<void> {
    await this.repo.createEntitlement({
      userId,
      resourceType: "PLAN",
      resourceId: planId,
      source: "ONE_TIME_PURCHASE",
      referenceId: paymentId,
      validUntil: undefined, // null = forever
    });

    logger.info({ userId, planId }, "Lifetime entitlement granted");
  }

  async grantCourseAccess(
    userId: string,
    courseId: string,
    referenceId: string,
  ): Promise<void> {
    await this.repo.createEntitlement({
      userId,
      resourceType: "COURSE",
      resourceId: courseId,
      source: "ONE_TIME_PURCHASE",
      referenceId,
    });
  }

  async grantAdminAccess(
    userId: string,
    resourceType: "PLAN" | "COURSE" | "BUNDLE",
    resourceId: string,
    validUntil?: Date | undefined,
  ): Promise<void> {
    await this.repo.createEntitlement({
      userId,
      resourceType,
      resourceId,
      source: "ADMIN_GRANT",
      validUntil,
    });

    logger.info({ userId, resourceType, resourceId }, "Admin entitlement granted");
  }

  async revokeSubscriptionAccess(subscriptionId: string): Promise<void> {
    await this.repo.revokeByReference(subscriptionId);
    logger.info({ subscriptionId }, "Subscription entitlements revoked");
  }

  // ─── Conectar con eventos de billing ────────────────────────────────────

  registerEventListeners(): void {
    eventBus.on("billing.subscription.activated", async ({ userId, planId, subscriptionId }) => {
      await this.grantPlanAccess(userId, planId, subscriptionId);
    });

    eventBus.on("billing.subscription.cancelled", async ({ subscriptionId }) => {
      await this.revokeSubscriptionAccess(subscriptionId);
    });

    eventBus.on("billing.subscription.past_due", async ({ subscriptionId }) => {
      // No revocar inmediatamente en past_due — Stripe reintentará
      // Solo loggear para que el admin esté al tanto
      logger.warn({ subscriptionId }, "Subscription past_due — monitoring for resolution");
    });
  }
}
