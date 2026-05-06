# Rudiment — Premium Drum Academy

Plataforma premium de membresía educativa para bateristas.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15 + TypeScript + Tailwind v4 |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL 16 (Drizzle ORM) |
| Cache/Queue | Redis (Upstash en prod) |
| Video | Mux |
| Storage | Cloudflare R2 |
| Pagos | Stripe |
| Email | Resend |
| Monorepo | Turborepo |

## Estructura

```
rudiment/
├── apps/
│   ├── web/          Next.js frontend
│   └── api/          Express backend
├── packages/
│   ├── types/        Tipos TypeScript compartidos
│   └── config/       TSConfig, ESLint base configs
├── infrastructure/
│   └── docker/       Docker Compose (Postgres + Redis local)
└── docs/
```

## Setup local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

```bash
# Backend
cp .env.example apps/api/.env

# Frontend
cp .env.example apps/web/.env.local
```

Editar ambos archivos con los valores correctos.
Los secrets de JWT se generan con:

```bash
openssl rand -base64 64
```

### 3. Levantar base de datos

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

### 4. Migraciones

```bash
npm run db:generate -w @rudiment/api
npm run db:migrate -w @rudiment/api
```

### 5. Desarrollo

```bash
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:4000
- DB Studio: `npm run db:studio -w @rudiment/api`

## Fases de construcción

Ver `docs/architecture.md` para el plan completo de 15 fases.
