# 123Tutors Platform (JavaScript Frontend + JavaScript Runtime Backend)

This repo is now set up as a JavaScript platform:

- `frontend/`: React JavaScript app (`react-scripts`, no Vite)
- `backend/`: integrated dashboard backend with JavaScript runtime output in `backend/dist`

Implemented platform areas include:

- Request form
- Student/parent signup
- Tutor signup and tutor dashboard
- Student dashboard
- Admin dashboard
- Analytics dashboard
- Smart tutor matching + tutor notifications
- Invoice PDF + email send endpoints

## Install

```bash
npm run install:all
```

## Environment Setup

1. Copy `frontend/.env.example` to `frontend/.env`
2. Copy `backend/.env.example` to `backend/.env`

Configure these before running:

- Database (`DB_*`)
- JWT (`JWT_SECRET`)
- Paystack (frontend public key)
- Google Maps key
- SMTP (`SMTP_*`) for invoice emails
- Supabase Storage S3 vars (`SUPABASE_S3_*`) if file upload is needed

## Run Locally

Backend (JavaScript runtime):

```bash
npm run dev:api
```

Frontend:

```bash
npm run dev:web
```

Optional backend TypeScript watch mode (if needed for source-level edits):

```bash
npm run dev:api:ts
```

## Key API Additions

- `GET /admin/find-tutor`: real tutor candidate search
- `POST /tutor-job-notifications/match/:requestUniqueId`: smart matching generation
- `POST /invoices/:uniqueId/send`: manual PDF email send
- `POST /invoices`: supports auto-send invoice flow
