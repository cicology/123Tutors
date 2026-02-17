# Backend-Frontend Connection Guide

## Issue: "Failed to Fetch" Error

This error means the frontend cannot connect to the backend server.

## Quick Fix Steps:

### 1. Start the Backend Server

Open a terminal in the `backend` folder and run:

```bash
cd backend
npm install  # Only needed first time or after dependency changes
npm run start:dev
```

Wait for the message: `Application is running on: http://localhost:3000`

### 2. Set Frontend API URL

Create a `.env` file in the root directory (same level as `package.json`) with:

```
VITE_API_URL=http://localhost:3000
```

If you're using a different port, update the URL accordingly.

### 3. Start the Frontend

Open another terminal in the root directory and run:

```bash
npm run dev
```

The frontend will typically run on `http://localhost:5173`

### 4. Verify Connection

Check the browser console - you should see:
- `[API] Making request to: http://localhost:3000/auth/login`
- `[API] Response status: 200 for http://localhost:3000/auth/login`

## Common Issues:

1. **Backend not running**: Make sure the backend server is running on port 3000
2. **Wrong port**: Check that `VITE_API_URL` matches your backend port
3. **Database not connected**: Make sure PostgreSQL is running and credentials in `backend/.env` are correct
4. **CORS errors**: Already fixed in `backend/src/main.ts` - should allow all origins

## Testing Connection:

You can test if the backend is accessible by visiting:
- http://localhost:3000/auth/login (should return an error about missing body, but confirms server is running)




