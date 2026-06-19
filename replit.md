# JiffyLaundry

A full-stack PWA for an on-demand laundry pickup and delivery service. Users can schedule pickups, get quick price quotes, view promotions, and track their orders.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite, Tailwind CSS, Framer Motion, Wouter

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas for the server
- `lib/db/src/schema/orders.ts` — orders table
- `lib/db/src/schema/offers.ts` — offers/promotions table
- `artifacts/api-server/src/routes/` — Express route handlers (orders, quotes, offers)
- `artifacts/jiffylaundry/src/pages/` — frontend pages (home, schedule, offers, account, track)
- `artifacts/jiffylaundry/public/manifest.json` — PWA manifest
- `artifacts/jiffylaundry/public/sw.js` — service worker

## Architecture decisions

- Contract-first: OpenAPI spec drives both frontend hooks (Orval → React Query) and backend validation (Orval → Zod)
- All API routes live in the shared `api-server` artifact; the frontend is a static Vite build
- Pricing is computed server-side in the quotes route (base + per-kg rate)
- Order cancellation uses PATCH /orders/:id with status=cancelled rather than DELETE to preserve history
- PWA manifest + service worker registered in main.tsx for installability

## Product

- Schedule laundry pickups (wash & fold, dry cleaning, ironing, express)
- Get instant price quotes based on service type and estimated weight
- View and track orders through a visual status timeline
- Browse active promotions and discount offers
- Account page shows order history and stats

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After changing `lib/db/src/schema/`, run `pnpm run typecheck:libs` before typechecking the api-server — stale lib declarations cause false "module has no exported member" errors
- Do not import from `@workspace/api-client-react/src/generated/api.schemas` deep paths — only import from `@workspace/api-client-react` (the package barrel)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
