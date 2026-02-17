# How to Start the Backend Server

## Quick Start

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Start the Server
```bash
npm run start:dev
```

### Step 3: Wait for Success Message
You should see:
```
Application is running on: http://localhost:3000
Swagger API Documentation: http://localhost:3000/api-docs
```

### Step 4: Open Swagger UI
Once you see the success message, open:
```
http://localhost:3000/api-docs
```

---

## Troubleshooting

### Issue: "Port 3000 already in use"

**Solution 1: Kill the process**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill it (replace PID with the number from above)
kill -9 <PID>
```

**Solution 2: Use a different port**
Create or edit `.env` file in backend directory:
```
PORT=3001
```
Then access Swagger at: `http://localhost:3001/api-docs`

### Issue: "Cannot find module" or dependency errors

**Solution:**
```bash
cd backend
npm install
npm run start:dev
```

### Issue: Database connection errors

**Solution:**
1. Make sure PostgreSQL is running
2. Check your `.env` file has correct database credentials
3. Verify database `tutor_dashboard` exists

### Issue: Server starts but Swagger doesn't load

**Check:**
1. Make sure you're accessing: `http://localhost:3000/api-docs` (not `/api`)
2. Check browser console for errors (F12)
3. Try hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

---

## Verification Checklist

- [ ] Backend directory: `cd backend`
- [ ] Dependencies installed: `npm install` (if needed)
- [ ] Server started: `npm run start:dev`
- [ ] Success message appears
- [ ] Browser opens: `http://localhost:3000/api-docs`
- [ ] Swagger UI loads successfully

---

## Common Commands

```bash
# Start development server
npm run start:dev

# Start production server
npm run start:prod

# Build the project
npm run build

# Check if server is running
lsof -ti:3000
```

