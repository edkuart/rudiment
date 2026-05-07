# Rudiment Deployment Checklist

Fecha de referencia: 2026-05-06

## Estado actual

El monorepo ya quedó alineado para un split real:

- `apps/frontend` para Vercel
- `apps/backend` para Railway

Scripts útiles desde la raíz:

- `npm run build:frontend`
- `npm run build:backend`
- `npm run start:frontend`
- `npm run start:backend`
- `npm run db:migrate`
- `npm run seed:plans`

## Vercel

Configura un proyecto para el frontend con:

- Root Directory: `apps/frontend`
- Framework Preset: Next.js
- Node.js: 22.x

Variables mínimas:

- `NEXT_PUBLIC_WEB_URL=https://tu-frontend.vercel.app`
- `NEXT_PUBLIC_API_URL=https://tu-backend.railway.app`

Nota:
`NEXT_PUBLIC_API_URL` debe ser el origen del backend, sin `/api/v1`.

## Railway

Para el backend usa un servicio del mismo repo y compártelo desde la raíz del
monorepo.

Build Command:

```bash
npm run build:backend
```

Start Command:

```bash
npm run start:backend
```

Health Check Path:

```text
/health
```

Variables mínimas:

- `NODE_ENV=production`
- `PORT=4000`
- `API_URL=https://tu-backend.railway.app`
- `WEB_URL=https://tu-frontend.vercel.app`
- `DATABASE_URL=...`
- `JWT_ACCESS_SECRET=...`
- `JWT_REFRESH_SECRET=...`

Variables por integración:

- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_*_PRICE_ID`
- Mux: `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`, `MUX_SIGNING_KEY_ID`, `MUX_SIGNING_PRIVATE_KEY`, `MUX_WEBHOOK_SECRET`
- R2: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
- Resend: `RESEND_API_KEY`, `EMAIL_FROM`
- Sentry: `SENTRY_DSN`

## Base de datos

Después de provisionar PostgreSQL:

```bash
npm run db:migrate
npm run seed:plans
```

Sin `seed:plans`, la capa de billing queda sin planes públicos aunque Stripe
esté configurado.

## Cookies y CORS

El backend ahora ajusta cookies para despliegues cross-site entre Railway y
Vercel:

- `SameSite=None` cuando frontend y backend viven en orígenes distintos
- `Secure=true` en producción
- cookie de access token + cookie de refresh token

Esto deja funcionales login, refresh y llamadas autenticadas desde el frontend
desplegado.

## Último chequeo antes de subir

1. Ejecuta `npm run typecheck`
2. Ejecuta `npm run test`
3. Ejecuta `npm run build`
4. Verifica `GET /health`
5. Verifica login, register, library, dashboard, admin y pricing
6. Verifica que `billing/plans` devuelva filas reales en producción
