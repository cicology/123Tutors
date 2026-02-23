# 123Tutors Production Env Checklist

Use this checklist before deploying the platform.

## 1. Frontend Env (`frontend/.env`)

Required:

```env
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
```

## 2. Backend Env (`backend/.env`)

Required:

```env
# Database
DB_HOST=your-project-ref.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_db_password
DB_DATABASE=postgres

# Auth
JWT_SECRET=replace-with-strong-secret
JWT_EXPIRES_IN=24h

# App
PORT=8081
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com

# Paystack
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx

# Supabase Storage (S3 compatible)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_S3_ENDPOINT=https://your-project-ref.supabase.co/storage/v1/s3
SUPABASE_BUCKET_REGION=us-east-1
SUPABASE_BUCKET_NAME=123_bursary_images
SUPABASE_S3_ACCESS_KEY=your_s3_access_key
SUPABASE_S3_SECRET_ACCESS_KEY=your_s3_secret_access_key

# Invoice email delivery
INVOICE_AUTO_SEND=true
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=noreply@123tutors.co.za
```

Optional:

```env
SUPABASE_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_JWT_SECRET=optional_if_needed_for_custom_flows
```

## 3. Paystack Webhook Setup

In Paystack dashboard:

1. Set webhook URL to:
   - `https://your-api-domain.com/payments/paystack/webhook`
2. Ensure live secret key in backend matches your Paystack live account.
3. Send a test event and confirm your API returns `200`.

## 4. Supabase Setup

1. Confirm Postgres credentials are valid and network-accessible by backend host.
2. Confirm `123_bursary_images` bucket exists and allows intended read/write policy.
3. Apply SQL migrations from `backend/migrations/` if schema is not yet in place.

## 5. Smoke Tests

1. Login/register from frontend.
2. Create tutor request.
3. Start a Paystack payment and confirm:
   - webhook hits backend successfully
   - request/invoice status updates
4. Create invoice with `autoSendEmail=true` and confirm email delivery.
5. Verify file upload path uses Supabase Storage URL.
