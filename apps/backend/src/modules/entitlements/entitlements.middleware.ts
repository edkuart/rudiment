import type { Request, Response, NextFunction } from "express";
import type { EntitlementsService } from "./entitlements.service.js";

/**
 * Factory que retorna un middleware verificando si req.user tiene acceso al
 * recurso indicado. Usado por los módulos de courses/lessons/video.
 *
 * Ejemplo de uso:
 *   router.get("/:id/play", requireAuth, requireEntitlement(service, "PLAN", "any"), controller.play)
 */
export function requireEntitlement(
  service: EntitlementsService,
  resourceType: "PLAN" | "COURSE" | "BUNDLE",
  // "any" = solo verifica que tenga plan activo; un ID concreto verifica ese recurso
  resourceId: string | ((req: Request) => string),
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } });
      return;
    }

    const id = typeof resourceId === "function" ? resourceId(req) : resourceId;

    try {
      const hasAccess = await service.hasAccess(req.user.id, resourceType, id);
      if (!hasAccess) {
        res.status(403).json({
          error: { code: "NO_ACCESS", message: "You need an active subscription to access this content" },
        });
        return;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
