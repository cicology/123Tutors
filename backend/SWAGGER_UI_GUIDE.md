# Swagger UI Guide - Complete Tutorial

## What is Swagger UI?

**Swagger UI** is an interactive API documentation tool that allows you to:
- 📖 View all your API endpoints in a beautiful, organized interface
- 🧪 Test API endpoints directly from your browser
- 📝 See request/response examples
- 🔐 Test authenticated endpoints with JWT tokens
- 📊 Understand API structure and data models

Think of it as a **visual playground** for your API where you can test everything without writing code!

---

## How to Access Swagger UI

### Step 1: Start Your Backend Server

Make sure your backend is running:

```bash
cd backend
npm run start:dev
```

You should see:
```
Application is running on: http://localhost:3000
Swagger API Documentation: http://localhost:3000/api-docs
```

### Step 2: Open Swagger UI in Your Browser

1. Open your web browser (Chrome, Firefox, Safari, etc.)
2. Navigate to: **http://localhost:3000/api-docs**
3. You should see the Swagger UI interface!

---

## Swagger UI Interface Overview

When you open Swagger UI, you'll see:

### 1. **Header Section**
- **Title**: "TutorFlow API"
- **Description**: API documentation description
- **Version**: API version (1.0)
- **🔓 Authorize** button: Click to add your JWT token for authenticated endpoints

### 2. **Tags Section**
All endpoints are organized by tags:
- **Authentication** - Login, registration endpoints
- **Tutors** - All tutor-related endpoints ⭐ (Your focus!)
- **Students** - Student management
- **Courses** - Course CRUD operations
- **Lessons** - Lesson scheduling
- **Requests** - Course requests
- **Payments** - Payment processing
- **Reviews** - Reviews and ratings
- **Chats** - Messaging system
- **Notifications** - Notification system
- **Referrals** - Referral system
- **Analytics** - Analytics endpoints
- **Admin** - Admin endpoints

### 3. **Endpoint Cards**
Each endpoint shows:
- **Method** (GET, POST, PATCH, DELETE) with color coding
- **Path** (e.g., `/tutors/dashboard`)
- **Description** of what the endpoint does
- **Parameters** required
- **Request body** structure
- **Response** examples

---

## Using Swagger UI - Step by Step

### Example 1: Testing a Public Endpoint (No Authentication)

Let's test the **GET /tutors/marketplace** endpoint:

1. **Find the endpoint**: Scroll to the **Tutors** section
2. **Click** on `GET /tutors/marketplace` to expand it
3. **Read the description**: "Get all approved tutors for marketplace"
4. **Click** the **"Try it out"** button (top right of the endpoint card)
5. **Click** the **"Execute"** button (blue button at the bottom)
6. **View the response**: 
   - **Response Code**: Should be `200`
   - **Response Body**: JSON array of tutors
   - **Response Headers**: Server response headers

### Example 2: Testing an Authenticated Endpoint

Let's test **GET /tutors/dashboard** (requires authentication):

#### Step 1: Get Your JWT Token

First, you need to login to get a token:

1. Go to **Authentication** section
2. Find **POST /auth/login**
3. Click **"Try it out"**
4. Enter login credentials:
   ```json
   {
     "email": "tutor@example.com",
     "password": "yourpassword"
   }
   ```
5. Click **"Execute"**
6. **Copy the token** from the response:
   ```json
   {
     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```

#### Step 2: Authorize in Swagger

1. Click the **🔓 Authorize** button (top right of Swagger UI)
2. In the **"JWT-auth"** field, paste your token:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Click **"Authorize"**
4. Click **"Close"**

#### Step 3: Test the Protected Endpoint

1. Go to **Tutors** section
2. Find **GET /tutors/dashboard**
3. Click **"Try it out"**
4. Click **"Execute"**
5. You should see the dashboard data!

**Note**: The lock icon 🔒 next to the endpoint means it requires authentication.

---

## All Tutor Endpoints in Swagger UI

Here are all the tutor endpoints you can test:

### 1. **GET /tutors/marketplace** (Public)
- **Description**: Get all approved tutors for marketplace
- **Authentication**: ❌ Not required
- **Response**: Array of tutor objects

### 2. **GET /tutors/dashboard** (Protected)
- **Description**: Get tutor dashboard data
- **Authentication**: ✅ Required (JWT token)
- **Response**: Dashboard statistics and data

### 3. **GET /tutors/profile** (Protected)
- **Description**: Get authenticated tutor's profile
- **Authentication**: ✅ Required
- **Response**: Tutor profile object

### 4. **POST /tutors/apply** (Protected)
- **Description**: Apply as a tutor (student → tutor conversion)
- **Authentication**: ✅ Required (Student role)
- **Request Body**: ApplyTutorDto
- **Response**: Created tutor object

### 5. **PATCH /tutors/profile** (Protected)
- **Description**: Update tutor profile
- **Authentication**: ✅ Required
- **Request Body**: UpdateTutorDto
- **Response**: Updated tutor object

### 6. **GET /tutors/:id** (Protected)
- **Description**: Get tutor by ID
- **Authentication**: ✅ Required
- **Parameters**: `id` (path parameter - tutor UUID)
- **Response**: Tutor object

---

## Understanding Request/Response Examples

### Request Body Example

When you expand an endpoint that requires a body (POST, PATCH), you'll see:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+27123456789",
  "location": "Cape Town",
  "subjects": "Mathematics, Physics",
  "qualifications": "BSc Mathematics",
  "experience": "5 years teaching experience"
}
```

You can:
- **Edit** the JSON directly in Swagger
- **Use the example** provided
- **Clear** and start fresh

### Response Examples

Swagger shows you:
- **200 OK**: Success response with example data
- **401 Unauthorized**: When authentication fails
- **404 Not Found**: When resource doesn't exist
- **400 Bad Request**: When validation fails

---

## Tips & Tricks

### 1. **Persistent Authorization**
- Swagger is configured to remember your token after page refresh
- You only need to authorize once per session

### 2. **Testing Different Scenarios**
- Try invalid data to see error responses
- Test with different user roles (tutor, student, admin)
- Test edge cases (empty strings, null values, etc.)

### 3. **Copy cURL Command**
- After executing an endpoint, Swagger provides a **cURL** command
- You can copy this to test in terminal or Postman

### 4. **Schema Reference**
- Click on schema names to see full data models
- Understand required vs optional fields
- See data types and examples

### 5. **Filter Endpoints**
- Use the search box to find specific endpoints
- Click tags to filter by category

---

## Common Use Cases

### Use Case 1: Testing Tutor Registration Flow

1. **Register as Student**: `POST /auth/register/student`
2. **Login**: `POST /auth/login` → Get token
3. **Authorize**: Add token to Swagger
4. **Apply as Tutor**: `POST /tutors/apply`
5. **Check Profile**: `GET /tutors/profile` (after admin approval)

### Use Case 2: Testing Tutor Dashboard

1. **Login as Tutor**: `POST /auth/login` (with tutor credentials)
2. **Authorize**: Add token
3. **Get Dashboard**: `GET /tutors/dashboard`
4. **View Profile**: `GET /tutors/profile`
5. **Update Profile**: `PATCH /tutors/profile`

### Use Case 3: Testing Marketplace

1. **Get Marketplace**: `GET /tutors/marketplace` (no auth needed)
2. **Get Specific Tutor**: `GET /tutors/:id` (requires auth)

---

## Troubleshooting

### Issue: "401 Unauthorized"
**Solution**: 
- Make sure you clicked "Authorize" and added your JWT token
- Check that your token hasn't expired
- Verify you're logged in with the correct role

### Issue: "404 Not Found"
**Solution**:
- Check the endpoint path is correct
- Verify the resource ID exists
- Ensure the server is running

### Issue: "400 Bad Request"
**Solution**:
- Check your request body matches the schema
- Verify required fields are provided
- Check data types (string vs number, etc.)

### Issue: Swagger UI Not Loading
**Solution**:
- Verify backend is running on port 3000
- Check URL: `http://localhost:3000/api-docs`
- Clear browser cache
- Try incognito mode

### Issue: Can't See Tutor Endpoints
**Solution**:
- Scroll down to find "Tutors" tag
- Use browser search (Ctrl+F / Cmd+F) for "tutors"
- Check that Swagger is properly configured

---

## Advanced Features

### 1. **Export API Documentation**
- Swagger provides OpenAPI JSON specification
- Access at: `http://localhost:3000/api-docs-json`
- Use this to import into Postman, Insomnia, etc.

### 2. **Schema Models**
- Click on any model name (e.g., `UpdateTutorDto`) to see full schema
- Understand all properties and their types
- See validation rules

### 3. **Response Headers**
- View response headers after execution
- Check CORS headers
- See content-type, etc.

---

## Quick Reference

| Action | How To |
|--------|--------|
| **Access Swagger** | `http://localhost:3000/api-docs` |
| **Authorize** | Click 🔓 Authorize → Paste JWT token |
| **Test Endpoint** | Click endpoint → "Try it out" → "Execute" |
| **View Response** | Scroll down after execution |
| **Copy cURL** | Find cURL command after execution |
| **Filter Endpoints** | Use search box or click tags |

---

## Next Steps

1. ✅ **Access Swagger UI**: Open `http://localhost:3000/api-docs`
2. ✅ **Explore Tutor Endpoints**: Check all 6 tutor endpoints
3. ✅ **Test Authentication**: Login and authorize
4. ✅ **Test Endpoints**: Try each tutor endpoint
5. ✅ **Read Documentation**: Understand request/response structures

---

## Summary

**Swagger UI** is your best friend for:
- 📚 Understanding your API
- 🧪 Testing endpoints
- 📖 Sharing API documentation
- 🐛 Debugging issues
- 👥 Onboarding new developers

**Access it now**: `http://localhost:3000/api-docs`

Happy testing! 🚀

