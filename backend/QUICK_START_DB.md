# Quick Start: Database Connection

## Step 1: Start PostgreSQL

Make sure PostgreSQL is running:

```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# If not running, start it (Mac with Homebrew)
brew services start postgresql@17
# or
brew services start postgresql
```

## Step 2: Create the Database

Connect to PostgreSQL and create the database:

```bash
# Connect to PostgreSQL (you'll be prompted for password)
psql -U postgres

# In psql, create the database
CREATE DATABASE tutor_dashboard;

# Verify it was created
\l

# Exit psql
\q
```

## Step 3: Create .env File

Create a `.env` file in the `backend` directory with the following content:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password_here
DB_NAME=tutor_dashboard

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# File Upload Configuration
UPLOAD_DIR=./uploads
```

**Important:** Replace `your_postgres_password_here` with your actual PostgreSQL password.

## Step 4: Test Database Connection

Test the connection:

```bash
npm run test:db
```

This will verify:
- ✅ PostgreSQL is running
- ✅ Database exists
- ✅ Credentials are correct
- ✅ Connection works

## Step 5: Start the Backend

Once the connection test passes:

```bash
npm install  # If you haven't already
npm run start:dev
```

The backend will automatically create all tables when it starts (in development mode).

## Alternative: Use the Setup Script

You can also use the automated setup script:

```bash
./setup-database.sh
```

This script will:
- Check if PostgreSQL is running
- Start it if needed
- Prompt for credentials
- Create the database
- Create the .env file

## Troubleshooting

### PostgreSQL not running
```bash
# Check status
brew services list | grep postgres

# Start it
brew services start postgresql@17
```

### Connection refused
- Make sure PostgreSQL is running
- Check the port (default is 5432)
- Verify credentials in `.env`

### Database doesn't exist
```bash
psql -U postgres -c "CREATE DATABASE tutor_dashboard;"
```

### Password authentication failed
- Double-check your password in `.env`
- Make sure you're using the correct username (usually `postgres`)

## Verify Tables Were Created

After starting the backend, verify tables:

```bash
psql -U postgres -d tutor_dashboard -c "\dt"
```

You should see tables like:
- tutors
- students
- courses
- lessons
- reviews
- chats
- etc.



