# TutorFlow Backend

NestJS backend API for the TutorFlow tutoring platform.

## Tech Stack

- **Framework:** NestJS
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Authentication:** JWT (Passport)
- **Validation:** class-validator

## Project Structure

```
backend/
├── src/
│   ├── auth/              # Authentication module
│   ├── tutors/            # Tutor management
│   ├── students/          # Student management
│   ├── courses/           # Course CRUD operations
│   ├── lessons/           # Lesson scheduling
│   ├── reviews/           # Reviews and ratings
│   ├── chats/             # Messaging system
│   ├── analytics/         # Analytics and stats
│   ├── payments/          # Payment management
│   ├── referrals/         # Referral system
│   ├── admin/             # Admin endpoints
│   ├── common/            # Shared utilities, guards, decorators
│   ├── config/            # Configuration files
│   └── main.ts            # Application entry point
├── .env                   # Environment variables (create from .env.example)
└── package.json
```

## Setup Instructions

### 1. Install PostgreSQL

See `DATABASE_SETUP.md` for detailed instructions on installing and setting up PostgreSQL.

### 2. Create Database

```sql
CREATE DATABASE tutor_dashboard;
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment

Copy `.env.example` to `.env` and update with your database credentials:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Or create manually
```

Edit `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
DB_NAME=tutor_dashboard

JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development
```

### 5. Run the Application

Development mode (with hot reload):
```bash
npm run start:dev
```

Production mode:
```bash
npm run build
npm run start:prod
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /auth/register` - Register as tutor
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user

### Tutors
- `GET /tutors/dashboard` - Get dashboard data
- `GET /tutors/profile` - Get profile
- `PATCH /tutors/profile` - Update profile

### Courses
- `GET /courses` - List all courses
- `POST /courses` - Create course
- `GET /courses/:id` - Get course
- `PATCH /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course

### Students
- `GET /students` - List students
- `GET /students/:id` - Get student details

### Lessons
- `GET /lessons` - List all lessons
- `GET /lessons/upcoming` - Get upcoming lessons
- `POST /lessons` - Create lesson
- `PATCH /lessons/:id` - Update lesson
- `DELETE /lessons/:id` - Delete lesson

### Reviews
- `GET /reviews` - List reviews
- `GET /reviews/rating` - Get rating stats

### Chats
- `GET /chats` - List all chats
- `GET /chats/with/:studentId` - Get or create chat
- `GET /chats/:id` - Get chat messages
- `POST /chats/messages` - Send message

### Analytics
- `GET /analytics/dashboard` - Get dashboard analytics

### Payments
- `GET /payments` - List payments
- `GET /payments/summary` - Get payment summary
- `POST /payments/request` - Request payment

### Referrals
- `GET /referrals` - List referrals
- `POST /referrals/generate` - Generate referral code
- `GET /referrals/stats` - Get referral stats

### Admin
- `GET /admin/applications` - List all applications
- `GET /admin/applications/pending` - List pending applications
- `PATCH /admin/applications/:id` - Update application status

## Database Schema

The database automatically creates tables on startup (development mode). Main tables:

- `tutors` - Tutor profiles
- `tutor_applications` - Tutor applications
- `students` - Student profiles
- `courses` - Courses offered
- `lessons` - Scheduled lessons
- `reviews` - Student reviews
- `chats` - Chat conversations
- `messages` - Chat messages
- `payments` - Payment records
- `referrals` - Referral codes
- `analytics` - Analytics data

## Authentication

The API uses JWT authentication. Include the token in requests:

```
Authorization: Bearer <token>
```

Tokens are returned on login and stored in localStorage by the frontend.

## Development Notes

- Database auto-sync is enabled in development (`synchronize: true`)
- For production, use migrations instead
- CORS is enabled for `http://localhost:8080` and `http://localhost:5173`
- All endpoints except `/auth/*` require authentication

## Next Steps

1. Set up PostgreSQL (see `DATABASE_SETUP.md`)
2. Install dependencies: `npm install`
3. Configure `.env` file
4. Start the server: `npm run start:dev`
5. Start the frontend (from root directory): `npm run dev`
