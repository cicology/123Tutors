# Next.js + Supabase Migration Runbook

## Goal
Use the Next.js dashboard (`web/`) and Nest backend (`backend/`) as the replacement stack for Bubble while keeping behavior and schema parity.

## Source Integration

- Next.js UI source integrated from:
  - `C:\Users\Heri\Downloads\123bursary-dashboard-main\123bursary-dashboard-main`
- Backend source integrated from:
  - `C:\Users\Heri\Downloads\123tutors-dashboard-backend-main\123tutors-dashboard-backend-main`
- Active backend in this repo is a superset of that backend source and should be treated as canonical.

## 1. Configure Environments

### `web/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_URL=http://localhost:8081
```

### `backend/.env`

```env
DB_HOST=...
DB_PORT=5432
DB_USERNAME=...
DB_PASSWORD=...
DB_DATABASE=postgres
DB_SYNCHRONIZE=false
JWT_SECRET=...
JWT_EXPIRES_IN=24h
PORT=8081
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

For one-time schema creation, set `DB_SYNCHRONIZE=true` or run the bootstrap command below.

## 2. Install and Run

```bash
npm run install:all
```

Run in two terminals:

```bash
npm run dev:api
npm run dev:web
```

## 3. Bootstrap Supabase Schema

On a fresh Supabase Postgres database:

```bash
npm run schema:bootstrap
```

This command creates tables from current backend entities (`backend/src/**/*.entity.ts`) using TypeORM synchronize.

## 4. Data Migration Strategy from Bubble

1. Freeze Bubble writes during final cutover window.
2. Run extraction + transform scripts:

```bash
npm run bubble:extract
npm run bubble:transform
```

3. Dry-run load:

```bash
MIGRATION_DRY_RUN=true npm run bubble:load
```

4. Real load:

```bash
MIGRATION_DRY_RUN=false npm run bubble:load
```

5. Validate counts and sample records per table.
6. Switch frontend traffic to Next.js app and monitor.

## 5. API Parity Notes

- Next frontend calls backend endpoints through `lib/api-service.ts`.
- Update routes and payload mappers in that file if any Bubble-specific fields are still needed.
- HTTP method compatibility already aligned for:
  - `PATCH /invoices/:uniqueId`
  - `PATCH /lessons/:uniqueId`
  - `PATCH /student-progress/:uniqueId`

## 6. Security Before Cutover

If Bubble remains online during migration:

- Disable or restrict public Bubble Data API (`/api/1.1/obj/*`).
- Disable or protect workflow endpoints (`/api/1.1/wf/*`).
- Rotate any exposed credentials.

## 7. Suggested Cutover Sequence

1. Run schema bootstrap and imports in Supabase.
2. Smoke-test all core flows on Next + Nest.
3. Point domain/app traffic to new stack.
4. Keep Bubble read-only for rollback window.
5. Decommission Bubble endpoints after verification.
