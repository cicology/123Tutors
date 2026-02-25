# Bubble -> Supabase Migration Scripts

These scripts migrate data from Bubble Data API into your Postgres/Supabase database.

## Scripts

- `npm run bubble:extract`
  - Pulls Bubble object data from `/api/1.1/obj/*`
  - Writes files to `backend/migration-data/raw`

- `npm run bubble:transform`
  - Flattens Bubble records and normalizes keys
  - Writes files to `backend/migration-data/normalized`

- `npm run bubble:load`
  - Loads normalized files into Postgres tables with UPSERT
  - Uses table mappings from `config.js`

- `npm run bubble:migrate`
  - Runs extract + transform + load in sequence

## Required Env

Set DB envs in `backend/.env`:

```env
# Option A (recommended): single connection string
DATABASE_URL=postgresql://postgres:password@db.your-project-ref.supabase.co:5432/postgres

# Option B: split fields
DB_HOST=...
DB_PORT=5432
DB_USERNAME=...
DB_PASSWORD=...
DB_DATABASE=postgres
```

Optional Bubble envs:

```env
BUBBLE_BASE_URL=https://123tutors.co.za
BUBBLE_TYPES=user,tutorrequestsdb,courses_db
BUBBLE_API_TOKEN=
BUBBLE_PAGE_SIZE=100
BUBBLE_DELAY_MS=150
BUBBLE_RETRIES=3
MIGRATION_DRY_RUN=true
```

## Recommended Run

1. Dry run load first:

```bash
npm run bubble:extract
npm run bubble:transform
MIGRATION_DRY_RUN=true npm run bubble:load
```

2. Real load:

```bash
MIGRATION_DRY_RUN=false npm run bubble:load
```

## Notes

- Mappings are defined in `backend/scripts/bubble-migration/config.js`.
- The current mapping covers primary Bubble types needed for initial parity:
  - `user`, `tutorrequestsdb`, `courses_db`, `bank_db`, `bursary_names_db`,
    `school_names_db`, `tertiary_names_db`, `tertiary_programmes_db`,
    `tertiary_specializations_db`
- If Bubble has extra object types you need, add them in `config.js`.
