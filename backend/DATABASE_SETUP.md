# PostgreSQL Database Setup Guide

This guide will help you set up PostgreSQL for the TutorFlow backend.

## Step 1: Install PostgreSQL

### Windows:
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. During installation:
   - Remember the password you set for the `postgres` user (default username)
   - Keep the default port as `5432`
   - Install pgAdmin 4 (optional but helpful)
4. Complete the installation

### Mac:
```bash
# Using Homebrew
brew install postgresql@14
brew services start postgresql@14
```

### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Step 2: Create the Database

### Using psql (Command Line):

1. Open a terminal/command prompt

2. Connect to PostgreSQL:
   ```bash
   # Windows (if psql is in PATH)
   psql -U postgres
   
   # Or if you need to specify the path
   # C:\Program Files\PostgreSQL\14\bin\psql.exe -U postgres
   ```

3. Enter your password when prompted

4. Create the database:
   ```sql
   CREATE DATABASE tutor_dashboard;
   ```

5. Verify it was created:
   ```sql
   \l
   ```
   You should see `tutor_dashboard` in the list

6. Exit psql:
   ```sql
   \q
   ```

### Using pgAdmin (GUI - Windows/Mac):

1. Open pgAdmin 4
2. Connect to your PostgreSQL server (enter your password)
3. Right-click on "Databases" → "Create" → "Database"
4. Name: `tutor_dashboard`
5. Click "Save"

## Step 3: Configure Backend Environment

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Create a `.env` file (copy from .env.example if it exists):
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env
   
   # Or create manually
   ```

3. Edit the `.env` file with your database credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_postgres_password_here
   DB_NAME=tutor_dashboard

   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d

   PORT=3000
   NODE_ENV=development

   UPLOAD_DIR=./uploads
   ```

   **Important:** Replace `your_postgres_password_here` with the password you set during PostgreSQL installation.

## Step 4: Install Backend Dependencies

```bash
cd backend
npm install
```

## Step 5: Run the Backend

The backend will automatically create all tables when you start it (since `synchronize: true` is set for development):

```bash
npm run start:dev
```

You should see:
- "Application is running on: http://localhost:3000"
- Tables being created automatically

## Troubleshooting

### Can't connect to PostgreSQL:
- **Check if PostgreSQL is running:**
  - Windows: Check Services (search "services" in Start menu, look for "postgresql")
  - Mac/Linux: `brew services list` or `sudo systemctl status postgresql`

- **Check port:** Make sure port 5432 is not being used by another application

- **Check password:** Make sure the password in `.env` matches your PostgreSQL password

### Password authentication failed:
- Make sure you're using the correct username and password
- Default username is usually `postgres`
- If you forgot your password, you may need to reset it

### Database already exists:
- Either use the existing database or drop it first:
  ```sql
  DROP DATABASE tutor_dashboard;
  CREATE DATABASE tutor_dashboard;
  ```

### Connection refused:
- Make sure PostgreSQL service is running
- Check firewall settings
- Verify the port in `.env` matches your PostgreSQL port

## Verify Database Setup

After starting the backend, you can verify tables were created:

1. Connect to PostgreSQL:
   ```bash
   psql -U postgres -d tutor_dashboard
   ```

2. List all tables:
   ```sql
   \dt
   ```

3. You should see tables like:
   - tutors
   - tutor_applications
   - students
   - courses
   - lessons
   - reviews
   - chats
   - messages
   - payments
   - referrals
   - analytics

4. Exit:
   ```sql
   \q
   ```

## Important Notes

- **Development Mode:** The `synchronize: true` setting automatically creates/updates tables. This is fine for development.
- **Production:** In production, use migrations instead of `synchronize: true`
- **Backup:** Always backup your database before making changes
- **Security:** Never commit your `.env` file to git (it's already in .gitignore)

## Next Steps

Once the database is set up:
1. Start the backend: `cd backend && npm run start:dev`
2. Start the frontend: `npm run dev` (from root directory)
3. Test registration at: http://localhost:8080/become-tutor

