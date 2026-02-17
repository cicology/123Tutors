# Tutor Functionalities Testing Guide

## Overview

This guide helps you test all tutor functionalities using mock data and verify that Swagger UI is up to date.

---

## Prerequisites

1. ✅ **Backend server running**: `npm run start:dev` in `backend` directory
2. ✅ **Database connected**: PostgreSQL running and connected
3. ✅ **Swagger UI accessible**: `http://localhost:3000/api-docs`

---

## Quick Test with Automated Script

### Step 1: Run the Test Script

```bash
cd backend
npm run test:tutors
```

This will automatically test:
- ✅ Tutor registration
- ✅ Tutor login
- ✅ Get marketplace tutors
- ✅ Get tutor dashboard
- ✅ Get tutor profile
- ✅ Update tutor profile
- ✅ Get tutor by ID
- ✅ Student registration (for apply test)
- ✅ Student login
- ✅ Apply as tutor (student → tutor)

### Step 2: View Results

The script will show:
- ✅ Passed tests
- ❌ Failed tests
- ⚠️ Skipped tests
- Summary statistics

---

## Manual Testing via Swagger UI

### Access Swagger UI

1. **Start backend server**:
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Open Swagger UI**:
   ```
   http://localhost:3000/api-docs
   ```

### Test Sequence

#### 1. Test Public Endpoint (No Auth Required)

**GET /tutors/marketplace**

1. Find `GET /tutors/marketplace` in Swagger UI
2. Click "Try it out"
3. Click "Execute"
4. **Expected**: Status 200, array of approved tutors

#### 2. Register a Tutor

**POST /auth/register**

1. Find `POST /auth/register` in Authentication section
2. Click "Try it out"
3. Use this mock data:
   ```json
   {
     "email": "test.tutor@example.com",
     "password": "TestPassword123!",
     "firstName": "John",
     "lastName": "Doe",
     "phone": "+27123456789",
     "location": "Cape Town",
     "subjects": "Mathematics, Physics",
     "qualifications": "BSc Mathematics",
     "experience": "5 years teaching"
   }
   ```
4. Click "Execute"
5. **Expected**: Status 201, tutor object returned
6. **Copy the tutor ID** from response

#### 3. Login as Tutor

**POST /auth/login**

1. Find `POST /auth/login`
2. Click "Try it out"
3. Use credentials from registration:
   ```json
   {
     "email": "test.tutor@example.com",
     "password": "TestPassword123!"
   }
   ```
4. Click "Execute"
5. **Expected**: Status 200, `access_token` in response
6. **Copy the access_token**

#### 4. Authorize in Swagger

1. Click **🔓 Authorize** button (top right)
2. Paste your `access_token` in "JWT-auth" field
3. Click "Authorize"
4. Click "Close"

#### 5. Test Protected Endpoints

**GET /tutors/dashboard**

1. Find `GET /tutors/dashboard` in Tutors section
2. Click "Try it out"
3. Click "Execute"
4. **Expected**: Status 200, dashboard data with statistics

**GET /tutors/profile**

1. Find `GET /tutors/profile`
2. Click "Try it out"
3. Click "Execute"
4. **Expected**: Status 200, tutor profile data

**PATCH /tutors/profile**

1. Find `PATCH /tutors/profile`
2. Click "Try it out"
3. Update profile:
   ```json
   {
     "firstName": "John",
     "lastName": "Smith",
     "phone": "+27987654321",
     "location": "Johannesburg",
     "subjects": "Mathematics, Physics, Chemistry"
   }
   ```
4. Click "Execute"
5. **Expected**: Status 200, updated profile

**GET /tutors/:id**

1. Find `GET /tutors/:id`
2. Click "Try it out"
3. Enter the tutor ID from registration
4. Click "Execute"
5. **Expected**: Status 200, tutor details

---

## All Tutor Endpoints in Swagger

| Endpoint | Method | Auth | Description | Status in Swagger |
|----------|--------|------|-------------|-------------------|
| `/tutors/marketplace` | GET | ❌ | Get all approved tutors | ✅ Documented |
| `/tutors/dashboard` | GET | ✅ | Get dashboard data | ✅ Documented |
| `/tutors/profile` | GET | ✅ | Get tutor profile | ✅ Documented |
| `/tutors/apply` | POST | ✅ | Apply as tutor | ✅ Documented |
| `/tutors/profile` | PATCH | ✅ | Update profile | ✅ Documented |
| `/tutors/:id` | GET | ✅ | Get tutor by ID | ✅ Documented |

---

## Database Verification

### Check Database Tables

Connect to PostgreSQL and verify tables exist:

```bash
psql -U postgres -d tutor_dashboard
```

```sql
-- List all tables
\dt

-- Check tutors table structure
\d tutors

-- Check if tutors exist
SELECT id, email, firstName, lastName, status FROM tutors LIMIT 5;

-- Check tutor_applications
SELECT * FROM tutor_applications LIMIT 5;
```

### Expected Tables

- ✅ `tutors` - Tutor profiles
- ✅ `tutor_applications` - Tutor applications
- ✅ `students` - Student profiles (for registration)
- ✅ `courses` - Courses
- ✅ `lessons` - Lessons
- ✅ `reviews` - Reviews
- ✅ `chats` - Chat conversations
- ✅ `messages` - Chat messages
- ✅ `payments` - Payments
- ✅ `referrals` - Referrals
- ✅ `analytics` - Analytics
- ✅ `course_requests` - Course requests
- ✅ `notifications` - Notifications

**Note**: `admins` table should NOT exist (removed).

---

## Swagger UI Verification Checklist

- [ ] Swagger UI loads at `http://localhost:3000/api-docs`
- [ ] "Tutors" tag is visible
- [ ] "Authentication" tag is visible
- [ ] All 6 tutor endpoints are listed
- [ ] All endpoints have descriptions
- [ ] Request/response examples are shown
- [ ] Authentication button works
- [ ] JWT token can be added
- [ ] Protected endpoints work after authorization

---

## Common Issues & Solutions

### Issue: "Cannot find module" errors
**Solution**: 
```bash
cd backend
npm install
```

### Issue: Database connection errors
**Solution**: 
1. Check PostgreSQL is running
2. Verify `.env` file has correct credentials
3. Run: `npm run test:db`

### Issue: Swagger UI not loading
**Solution**:
1. Verify backend is running: `npm run start:dev`
2. Check URL: `http://localhost:3000/api-docs`
3. Check console for errors

### Issue: 401 Unauthorized errors
**Solution**:
1. Make sure you logged in first
2. Copy the `access_token` from login response
3. Click "Authorize" in Swagger and paste token
4. Make sure token hasn't expired

### Issue: Tests fail with "fetch is not defined"
**Solution**:
- Node.js 18+ has fetch built-in
- For older versions: `npm install node-fetch`
- Or use: `node --experimental-fetch test-tutor-endpoints.js`

---

## Test Results Interpretation

### ✅ Success Indicators
- Status code: 200, 201
- Response contains expected data
- No error messages
- Database records created/updated

### ❌ Failure Indicators
- Status code: 400, 401, 404, 500
- Error messages in response
- Database records not created
- Validation errors

---

## Next Steps After Testing

1. **If all tests pass**: ✅ Tutor functionalities are working correctly
2. **If tests fail**: 
   - Check error messages
   - Verify database connection
   - Check server logs
   - Verify environment variables

3. **Update Swagger** (if needed):
   - All tutor endpoints should already be documented
   - If missing, add `@ApiOperation`, `@ApiResponse` decorators

4. **Database Updates**:
   - Tables are auto-created on server start (development mode)
   - If schema changed, restart server to sync

---

## Summary

✅ **All tutor endpoints are documented in Swagger UI**
✅ **Test script available**: `npm run test:tutors`
✅ **Database auto-syncs on server start**
✅ **All 6 tutor endpoints functional**

**Access Swagger UI**: `http://localhost:3000/api-docs`

