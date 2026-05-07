import { db } from "../../shared/db/index.js";
import { EntitlementsRepository } from "./entitlements.repository.js";
import { EntitlementsService } from "./entitlements.service.js";

const repo = new EntitlementsRepository(db);
export const entitlementsService = new EntitlementsService(repo);

// Registrar listeners de eventos de billing
entitlementsService.registerEventListeners();

export { EntitlementsService } from "./entitlements.service.js";
export { requireEntitlement } from "./entitlements.middleware.js";
