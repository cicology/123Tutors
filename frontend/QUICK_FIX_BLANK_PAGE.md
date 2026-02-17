# Quick Fix for Blank Page

## Step-by-Step Troubleshooting

### 1. Check Browser Console (MOST IMPORTANT)
1. Open your browser
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. Look for **red error messages**
5. **Copy and share any errors** you see

### 2. Verify Servers Are Running

**Frontend (Terminal 1):**
```powershell
npm run dev
```
Should show: `Local: http://localhost:8080/`

**Backend (Terminal 2):**
```powershell
cd backend
npm run start:dev
```
Should show: `Application is running on: http://localhost:3000`

### 3. Hard Refresh Browser
- Press **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac)
- Or clear cache: Settings → Privacy → Clear browsing data

### 4. Check URL
Make sure you're accessing: **http://localhost:8080** (not 8081 or other port)

### 5. Check Network Tab
1. Open DevTools (F12)
2. Go to **Network** tab
3. Refresh page
4. Look for:
   - **Failed requests** (red status)
   - **404 errors** (missing files)
   - **CORS errors**

### 6. Common Issues & Solutions

#### Issue: "Cannot find module" or "Module not found"
**Solution:**
```powershell
# Delete and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

#### Issue: "Port already in use"
**Solution:**
```powershell
# Kill processes on port 8080
Get-NetTCPConnection -LocalPort 8080 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

#### Issue: "VITE_API_URL" or API errors
**Solution:**
- Check if backend is running on port 3000
- Check `.env` file (if exists) for `VITE_API_URL`

#### Issue: White/blank page with no errors
**Solution:**
1. Check if `index.html` exists in root folder
2. Verify it has `<div id="root"></div>`
3. Check browser console for React errors

### 7. Rebuild Everything
```powershell
# Stop all servers (Ctrl+C)

# Frontend
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .vite
npm install
npm run dev

# Backend (in separate terminal)
cd backend
Remove-Item -Recurse -Force node_modules
npm install
npm run start:dev
```

### 8. Check for TypeScript Errors
```powershell
npm run build
```
This will show compilation errors if any exist.

## What to Tell Me

If the page is still blank, please provide:

1. **Browser Console Errors** (screenshot or copy text)
2. **Network Tab Errors** (screenshot)
3. **Terminal Output** when running `npm run dev`
4. **What URL you're accessing**
5. **What you see** (completely blank? white page? loading spinner?)

## Quick Test

Try accessing this URL directly:
```
http://localhost:8080/
```

If you see a blank page, check the browser console (F12) immediately.






