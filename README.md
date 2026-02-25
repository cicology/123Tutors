# 123Tutors Platform (Next.js + NestJS + Supabase Postgres)

This repository is now organized for the migration off Bubble:

- `web/`: Next.js bursary dashboard (imported from `123bursary-dashboard-main`)
- `backend/`: NestJS API (integrated superset of `123tutors-dashboard-backend-main`)
- `frontend/`: legacy CRA frontend kept for reference during migration

## Install

```bash
npm run install:all
```

Optional legacy frontend install:

```bash
npm run install:web:legacy
```

## Environment Setup

1. Copy `web/.env.example` to `web/.env.local`
2. Copy `backend/.env.example` to `backend/.env`

Required web env:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8081`)

Required backend env:

- Database (`DB_*`) using Supabase Postgres credentials
- `JWT_SECRET`
- `CORS_ORIGIN` (typically `http://localhost:3000` in local dev)

Optional backend env:

- `DB_SYNCHRONIZE=true` for one-time schema bootstrap
- Paystack, SMTP, and Supabase storage vars as needed

## Run Locally

Terminal 1 (API):

```bash
npm run dev:api
```

Terminal 2 (Next.js web):

```bash
npm run dev:web
```

Legacy web app (if needed):

```bash
npm run dev:web:legacy
```

## Supabase Schema Bootstrap

To create backend tables in a fresh Supabase Postgres database from current entities:

```bash
npm run schema:bootstrap
```

This runs TypeORM `synchronize` once through `backend/src/scripts/bootstrap-schema.ts`.

## Bubble Data Migration

ETL scripts for Bubble -> Supabase are included in `backend/scripts/bubble-migration`.

```bash
npm run bubble:extract
npm run bubble:transform
MIGRATION_DRY_RUN=true npm run bubble:load
MIGRATION_DRY_RUN=false npm run bubble:load
```

## Build

```bash
npm run build:api
npm run build:web
```

## Integration Notes

- The imported Next.js app now points to backend through `NEXT_PUBLIC_API_URL`.
- API method mismatches were aligned (`PATCH` for lessons/invoices/student-progress updates).
- Current backend includes everything from the downloaded backend plus extra production modules (for example payments/webhooks).

## Migration Context

- Live Bubble behavior and schema discovery were used to align API/UI parity.
- Bubble object to backend module mapping is documented in `docs/BUBBLE_PARITY_MAP.md`.
- Bubble API exposure should be locked down immediately before cutover.
- See `docs/PRODUCTION_ENV_CHECKLIST.md` for production checks.
