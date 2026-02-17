# 123tutors – Tutoring Platform

A full-stack tutoring platform connecting students with tutors. Built with React (Vite), NestJS, PostgreSQL, and TypeORM.

## Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+ (or 17)
- **Git**

---

## 1. PostgreSQL – Install & Connect

### macOS (Homebrew)

```bash
# Install PostgreSQL
brew install postgresql@17
# or: brew install postgresql@14

# Start PostgreSQL
brew services start postgresql@17
# or: brew services start postgresql

# Check it's running
pg_isready -h localhost -p 5432
```

### Windows

1. Download the installer: [PostgreSQL Windows](https://www.postgresql.org/download/windows/)
2. Run the installer. During setup:
   - Set and remember the **postgres** user password
   - Keep the default port **5432**
   - Optionally install **pgAdmin 4**
3. After install, PostgreSQL runs as a Windows service. You can start/stop it in **Services** (search “services” in the Start menu) or via pgAdmin.

### Create the database

**Option A – Command line (macOS / Linux / Windows with `psql` in PATH):**

```bash
psql -U postgres
```

Then in the `psql` prompt:

```sql
CREATE DATABASE tutor_dashboard;
\l
\q
```

**Option B – pgAdmin (Windows / Mac):**

1. Open pgAdmin and connect to your server (use the postgres password).
2. Right‑click **Databases** → **Create** → **Database**.
3. Name: `tutor_dashboard` → **Save**.

---

## 2. Backend – Setup & Run

```bash
cd backend
```

### Install dependencies

```bash
npm install
```

### Environment

Create a `.env` file in the `backend` folder:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password_here
DB_NAME=tutor_dashboard

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

PORT=3001
NODE_ENV=development

UPLOAD_DIR=./uploads
```

Replace `your_postgres_password_here` with your PostgreSQL password.

### Start the backend

```bash
npm run start:dev
```

- API: **http://localhost:3001**
- Swagger: **http://localhost:3001/api-docs**

Tables are created automatically in development. Keep this terminal open while developing.

---

## 3. Frontend – Setup & Run

Open a **new** terminal:

```bash
cd frontend
```

### Install dependencies

```bash
npm install
```

### Optional: API URL

The app talks to the backend at `http://localhost:3001` by default. To override, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
```

### Start the frontend

```bash
npm run dev
```

- App: **http://localhost:5173** (or the port Vite prints)

---

## 4. Quick reference

| Task              | Command / Location |
|-------------------|--------------------|
| Start PostgreSQL  | `brew services start postgresql@17` (Mac) or start service (Windows) |
| Create DB         | `psql -U postgres` then `CREATE DATABASE tutor_dashboard;` |
| Backend           | `cd backend && npm install && npm run start:dev` |
| Frontend          | `cd frontend && npm install && npm run dev` |
| Backend port      | 3001 (set in `backend/.env` as `PORT`) |
| Frontend port     | 5173 (Vite default) |

---

## 5. Test accounts (after DB is set up)

If you’ve run the seed or setup scripts, you can use:

- **Tutor:** `complete.tutor@example.com` / `tutor123`
- **Tutor (alternate):** `tutor20@example.com` / `Tutor123!`

---

## Project structure

```
tutors-main/
├── backend/          # NestJS API (port 3001)
│   ├── src/
│   └── .env         # you create this
├── frontend/        # React + Vite app (port 5173)
│   ├── src/
│   └── .env         # optional, for VITE_API_URL
└── README.md        # this file
```

---

## Troubleshooting

- **“Cannot connect to backend”**  
  Ensure the backend is running on port 3001 and `frontend/.env` (if used) has `VITE_API_URL=http://localhost:3001`.

- **“Password authentication failed”**  
  Check `DB_PASSWORD` in `backend/.env` matches your PostgreSQL postgres user password.

- **“Database does not exist”**  
  Create it: `psql -U postgres -c "CREATE DATABASE tutor_dashboard;"`

- **Port 3001 in use**  
  Change `PORT` in `backend/.env` and set `VITE_API_URL` in `frontend/.env` to the new URL (e.g. `http://localhost:3002`).
