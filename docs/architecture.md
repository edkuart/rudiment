# Rudiment Phase Audit

Fecha de auditoría: 2026-05-06

## Resumen

El monorepo cubre la mayoría del plan funcional original y ya incluye backend,
frontend de estudiante, frontend administrativo, billing, video, progreso y SEO.

La auditoría encontró tres brechas reales antes de este pase:

1. El frontend no compilaba en producción por imports con `.js` y config vieja de
   `typedRoutes`.
2. Faltaban páginas públicas y privadas del flujo de billing
   (`/pricing`, `/checkout/success`, `/settings/billing`).
3. La documentación decía que existía este archivo, pero no estaba en el repo.

Esas brechas quedaron corregidas en este pase. Lo que sigue parcial es la capa
de media descargable en el frontend, porque el backend existe pero todavía no
hay una experiencia completa para adjuntos en la UI.

## Estado por fase

| Fase | Estado | Evidencia |
|---|---|---|
| 0. Fundación del monorepo | Completa | Turborepo, workspaces npm, `apps/frontend`, `apps/backend`, `packages/config`, `packages/types`, TS estricto |
| 1. Esquema de base de datos | Completa | Esquemas Drizzle para users, billing, entitlements, courses, video, media, progress, analytics, webhook events |
| 2. Autenticación | Completa | JWT access + refresh, sesiones persistentes, reuse detection, profile endpoints, 9 tests |
| 3. Stripe y webhooks | Completa | Planes, checkout, portal, pagos, webhooks con idempotencia, 7 tests |
| 4. Entitlements | Completa | Servicio y repositorio dedicados, integración con eventos de billing |
| 5. Cursos y lecciones | Completa | CRUD backend, dashboard admin, library, detalle de curso, detalle de lección |
| 6. Video con Mux | Completa | Direct upload, webhooks Mux, tokens de playback, `VideoPlayer`, `VideoUploader` |
| 7. Media y descargas | Parcial | Backend R2 listo; falta una UI sólida de adjuntos para admin/estudiante |
| 8. Seguimiento de progreso | Completa | Heartbeat, progreso por curso, bookmarks, continue watching, dashboard estudiante |
| 9. Búsqueda y descubrimiento | Completa | Search, filtro por dificultad, tags y chips interactivos |
| 10. Dashboard estudiante | Completa | KPIs, continue watching, bookmarks, empty states |
| 11. Dashboard administrativo | Completa | KPIs, top courses, recent signups |
| 12. Email transaccional | Completa | Cliente Resend, template welcome, envío no bloqueante |
| 13. Perfil de usuario | Completa | `GET/PATCH /auth/me/profile` y pantalla `/settings/profile` |
| 14. SEO y metadatos | Completa | `generateMetadata`, `sitemap.ts`, `robots.ts` |
| 15. Polish y navegación | Completa con notas | Build y typecheck corregidos, home pública mejorada, faltaba documentación de arquitectura |

## Estado operativo actual

- `npm run typecheck`: pasa
- `npm run test`: pasa con 27 tests backend
- `npm run build`: debe pasar después de este pase

## Riesgos residuales

1. Billing depende de datos en la tabla `plans`. Ya existe `npm run seed:plans`,
   pero hay que ejecutarlo en cada ambiente.
2. La experiencia de media descargable sigue siendo el área menos terminada del
   producto frente al resto de las fases.
3. Stripe, Mux, R2 y Resend dependen completamente de variables reales en
   producción; si faltan, la app compilará pero esas capacidades quedarán
   degradadas o inactivas.
