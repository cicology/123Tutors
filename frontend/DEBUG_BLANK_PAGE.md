# Debugging Blank Page Issue

## Common Causes and Solutions

### 1. Check Browser Console
Open your browser's Developer Tools (F12) and check the **Console** tab for JavaScript errors.

**Common errors:**
- Module not found
- Syntax errors
- Import errors
- API connection errors

### 2. Check if Frontend Dev Server is Running
```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:8080/
```

### 3. Check if Backend is Running
```bash
cd backend
npm run start:dev
```

You should see:
```
Application is running on: http://localhost:3000
```

### 4. Check Network Tab
In browser DevTools → Network tab:
- Look for failed requests (red)
- Check if API calls are failing
- Verify CORS is working

### 5. Clear Browser Cache
- Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Clear browser cache and cookies
- Try incognito/private mode

### 6. Check Environment Variables
Make sure `.env` file exists (if needed) and `VITE_API_URL` is set correctly.

### 7. Check for Build Errors
```bash
npm run build
```

Look for compilation errors.

### 8. Reinstall Dependencies
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### 9. Check React Router
If you're on a specific route, make sure the route exists in `App.tsx`.

### 10. Check Root Element
Verify `index.html` has:
```html
<div id="root"></div>
```

## Quick Fix Steps

1. **Stop all servers** (Ctrl+C)
2. **Clear cache**: Delete `node_modules` and `.vite` folder
3. **Reinstall**: `npm install`
4. **Start backend**: `cd backend && npm run start:dev`
5. **Start frontend**: `npm run dev` (in root)
6. **Open browser**: `http://localhost:8080`
7. **Check console**: Look for errors

## What to Report

If the issue persists, please provide:
1. Browser console errors (screenshot or copy text)
2. Network tab errors (screenshot or copy text)
3. Terminal output when running `npm run dev`
4. Terminal output when running backend
5. Which URL you're accessing (homepage `/` or specific route)






