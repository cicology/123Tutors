# Swagger UI - Quick Start Guide

## 🚀 Quick Access

**URL**: `http://localhost:3000/api-docs`

## ✅ What I've Done

1. ✅ Configured Swagger in `main.ts`
2. ✅ Added all 6 tutor endpoints to Swagger UI
3. ✅ Added detailed documentation for each endpoint
4. ✅ Added request/response examples
5. ✅ Added authentication support (JWT Bearer token)

## 📋 Tutor Endpoints in Swagger

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/tutors/marketplace` | GET | ❌ No | Get all approved tutors |
| `/tutors/dashboard` | GET | ✅ Yes | Get tutor dashboard data |
| `/tutors/profile` | GET | ✅ Yes | Get tutor profile |
| `/tutors/apply` | POST | ✅ Yes | Apply as tutor |
| `/tutors/profile` | PATCH | ✅ Yes | Update tutor profile |
| `/tutors/:id` | GET | ✅ Yes | Get tutor by ID |

## 🔑 How to Use

### Step 1: Start Backend
```bash
cd backend
npm run start:dev
```

### Step 2: Open Swagger
Open browser: `http://localhost:3000/api-docs`

### Step 3: Test Public Endpoint
1. Find `GET /tutors/marketplace`
2. Click "Try it out"
3. Click "Execute"
4. See results!

### Step 4: Test Protected Endpoint
1. Login first: `POST /auth/login`
2. Copy the `access_token` from response
3. Click 🔓 "Authorize" button (top right)
4. Paste token in "JWT-auth" field
5. Click "Authorize"
6. Now test `GET /tutors/dashboard`

## 📖 Full Guide

See `SWAGGER_UI_GUIDE.md` for complete tutorial.

## ✨ Features Added

- ✅ Complete API documentation
- ✅ Interactive testing interface
- ✅ Request/response examples
- ✅ Authentication support
- ✅ Schema definitions
- ✅ Error response documentation

---

**Ready to test!** Open `http://localhost:3000/api-docs` 🎉

