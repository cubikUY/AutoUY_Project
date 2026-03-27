# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AutoUY** is a multi-tenant vehicle marketplace platform for Uruguay. It consists of two Next.js 15 apps sharing a common database and UI package:

- **`apps/admin-panel`** (port 3001) — Dealership management: inventory, users, branches, leads, audit logs
- **`apps/portal-web`** (port 3000) — Customer-facing portal: browse/compare/favorite vehicles, contact dealers

## Commands

All commands run from the repo root using pnpm and Turbo.

```bash
# Development
pnpm dev                  # Start all apps concurrently
pnpm dev --filter admin-panel   # Start only admin panel
pnpm dev --filter portal-web    # Start only portal web

# Build
pnpm build                # Build all apps
pnpm build --filter admin-panel

# Quality
pnpm lint                 # ESLint across all packages
pnpm type-check           # TypeScript checks across all packages
pnpm format               # Prettier formatting

# Database (runs against packages/database)
pnpm db:generate          # Regenerate Prisma client after schema changes
pnpm db:push              # Push schema to DB (dev only, no migration file)
pnpm db:migrate           # Create and apply migration file
pnpm db:studio            # Open Prisma Studio GUI
pnpm db:seed              # Seed initial data (admin, brands, sample dealer/vehicle)

pnpm clean                # Remove all build artifacts
```

## Architecture

### Monorepo Structure

```
apps/
  admin-panel/    # Next.js 15 App Router, port 3001
  portal-web/     # Next.js 15 App Router, port 3000
packages/
  database/       # Prisma schema + singleton client (@autouuy/database)
  ui/             # Shared Shadcn/Radix components (@autouuy/ui)
```

Orchestrated by **Turbo** (`turbo.json`) with pnpm workspaces.

### Database Layer (`packages/database`)

Single Prisma schema shared by both apps. The client is exported as a singleton from `packages/database/src/index.ts`. After any schema change run `pnpm db:generate`.

Key models and their relationships:
- **User** (roles: `ADMIN`, `DEALER`, `CLIENT`) → has `DealerProfile` (1:1), `Vehicle[]`, `Lead[]`, `Favorite[]`
- **Vehicle** → belongs to Brand, Model, Owner (User), DealerProfile, Branch; has `Image[]`, `Lead[]`
- **DealerProfile** → has `Branch[]`, `Vehicle[]`
- **Lead** → links User (buyer) + Vehicle + optional salesman
- **AuditLog** — tracks all system actions with old/new values

Enums: `VehicleType` (AUTO, MOTO, CAMION, CAMIONETA, UTILITARIO, BUS, OTRO), `VehicleCondition` (NEW, USED), `VehicleStatus` (DRAFT, ACTIVE, SOLD, PAUSED), `LeadStatus` (NEW, CONTACTED, CLOSED).

### Authentication

Both apps use **NextAuth.js v5** (beta) with credentials provider. Configuration lives in `src/auth.ts` + `src/auth.config.ts` in each app. JWT tokens carry `id` and `role`. Middleware (`src/middleware.ts`) protects all routes except `/login`. `AUTH_SECRET` must be identical in both apps.

### Image Storage

Vehicle images are stored in **Cloudflare R2** (S3-compatible). Admin panel uses `@aws-sdk/client-s3` + `sharp` for upload/resize. Images are served via `NEXT_PUBLIC_R2_BASE_URL` (CDN). Keys stored in the `Image` model alongside the public URL.

### Shared UI Package (`packages/ui`)

Exports Shadcn/Radix-based components and a `globals.css`. Consumed by both apps via `@autouuy/ui`. Both `next.config.ts` files must `transpilePackages: ['@autouuy/ui', '@autouuy/database']`.

### Deployment

Deployed to **Google Cloud Run** (region: `southamerica-east1`) via **Google Cloud Build** (`cloudbuild.yaml`). Each app is a separate Docker image built with multi-stage Dockerfiles (`Dockerfile.portal`, `Dockerfile.admin`) using standalone Next.js output. Images are pushed to Artifact Registry (`autouy-repo`). The database is Cloud SQL PostgreSQL.

## Environment Variables

Each app has a `.env.example`. Key variables:

| Variable | Used by |
|---|---|
| `DATABASE_URL` | Both apps (PostgreSQL connection string) |
| `AUTH_SECRET` | Both apps (must match) |
| `AUTH_URL` | Each app's own URL |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | Admin panel (uploads) |
| `R2_BUCKET_NAME` | Admin panel |
| `R2_ENDPOINT` | Admin panel |
| `NEXT_PUBLIC_R2_BASE_URL` | Both apps (image CDN URL) |

## Code Style

- **Prettier**: 100 char line width, 2-space tabs, trailing commas, `prettier-plugin-tailwindcss` for class ordering
- **TypeScript**: strict mode, ES2022 target, NodeNext modules
- Both apps use Next.js App Router with server components by default
