# Correct URLs for Your Application

## 🎯 Important: Use the Right Port!

### Frontend (React App) - Landing Page
**URL:** `http://localhost:8080/`

This is where you access the application:
- Landing page
- All frontend pages
- User interface

**To start:**
```powershell
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:8080/
```

---

### Backend (API Server) - Not for Browsing
**URL:** `http://localhost:3000/`

This is the API server (not for viewing in browser):
- Provides API endpoints
- Returns JSON data
- Used by frontend to fetch data

**To start:**
```powershell
cd backend
npm run start:dev
```

**Expected output:**
```
Application is running on: http://localhost:3000
```

---

## ✅ Quick Start

1. **Start Backend** (Terminal 1):
   ```powershell
   cd backend
   npm run start:dev
   ```
   Wait for: `Application is running on: http://localhost:3000`

2. **Start Frontend** (Terminal 2):
   ```powershell
   npm run dev
   ```
   Wait for: `Local: http://localhost:8080/`

3. **Open Browser:**
   Go to: **`http://localhost:8080/`** ← This is your landing page!

---

## ❌ Common Mistake

**Don't access:** `http://localhost:3000/` in your browser
- This shows the API info (JSON response)
- This is NOT the frontend

**Do access:** `http://localhost:8080/` in your browser
- This shows your React app
- This is the landing page

---

## Summary

- **Frontend (UI):** `http://localhost:8080/` ← Use this!
- **Backend (API):** `http://localhost:3000/` ← Only for API calls






