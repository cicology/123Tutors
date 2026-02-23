# 123Tutors Dashboard Backend

A comprehensive NestJS backend service for the 123Tutors Dashboard, providing CRUD operations for all database entities with authentication and validation middleware.

## 🚀 Features

- **Complete CRUD Operations** for all 15 database entities
- **JWT Authentication** with Supabase integration
- **RESTful API** with Swagger documentation
- **Input Validation** using class-validator
- **Database Integration** with TypeORM and PostgreSQL
- **Security Middleware** (Helmet, CORS, Compression)
- **Analytics Service** for dashboard statistics
- **Pagination & Search** across all endpoints

## 📋 Database Entities

The backend manages the following entities:

- **User Profiles** - User management and authentication
- **Bank** - Banking information
- **Bursary Names** - Bursary organizations
- **School Names** - Educational institutions
- **Tertiary Names** - Tertiary education institutions
- **Tertiary Programmes** - Academic programmes
- **Tertiary Specializations** - Specialized fields of study
- **Promo Codes** - Promotional codes management
- **Courses** - Course information
- **Bursary Students** - Student bursary records
- **Tutor Requests** - Tutoring request management
- **Tutor Sessions Orders** - Session booking system
- **Tutor Job Notifications** - Job notification system
- **Tutor Student Hours** - Hour tracking
- **Student Lessons** - Lesson management

📖 **For detailed database schema information, see [ERD.md](./ERD.md)** - Complete Entity Relationship Diagram with all attributes and relationships.

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT with Supabase
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS
- **Language**: TypeScript

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 123tutors-dashboard-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=rootuser
   DB_PASSWORD=root
   DB_DATABASE=booksdb

   # Supabase Configuration
   SUPABASE_PUBLIC_SUPABASE_URL=https://tzkeexmdlhguydmsbykt.supabase.co
   SUPABASE_JWT_SECRET=your-supabase-jwt-secret

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=24h

   # Application Configuration
   PORT=3000
   NODE_ENV=development

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3001

   # Swagger Configuration
   SWAGGER_TITLE=123Tutors Dashboard API
   SWAGGER_DESCRIPTION=Backend API for 123Tutors Dashboard
   SWAGGER_VERSION=1.0.0
   ```

4. **Database Setup**
   Ensure PostgreSQL is running and accessible with the credentials specified in your `.env` file.

## 🚀 Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Other Commands
```bash
# Build the project
npm run build

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Lint code
npm run lint

# Format code
npm run format
```

## 📚 API Documentation

Once the application is running, you can access:

- **API Documentation**: http://localhost:3000/api/docs
- **Application**: http://localhost:3000

The Swagger documentation provides interactive API testing and comprehensive endpoint documentation.

## 🔐 Authentication

The API uses JWT-based authentication with Supabase integration:

### Authentication Endpoints

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get user profile (protected)

### Protected Routes

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 API Endpoints

### Core CRUD Operations

Each entity supports standard CRUD operations:

- `GET /{entity}` - List all with pagination and search
- `GET /{entity}/:id` - Get by ID
- `POST /{entity}` - Create new
- `PATCH /{entity}/:id` - Update
- `DELETE /{entity}/:id` - Delete

### Special Endpoints

- `GET /analytics/dashboard` - Dashboard statistics
- `POST /tutor-requests/:id/approve` - Approve tutor request
- `POST /tutor-requests/:id/reject` - Reject tutor request

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_USERNAME` | Database username | rootuser |
| `DB_PASSWORD` | Database password | root |
| `DB_DATABASE` | Database name | booksdb |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration time | 24h |
| `PORT` | Application port | 3000 |
| `NODE_ENV` | Environment | development |

## 🏗️ Project Structure

```
src/
├── auth/                    # Authentication module
├── analytics/               # Dashboard analytics
├── bank/                    # Bank CRUD
├── bursary-names/          # Bursary organizations CRUD
├── bursary-students/       # Bursary students CRUD
├── courses/                # Courses CRUD
├── promo-codes/            # Promo codes CRUD
├── school-names/           # School names CRUD
├── student-lessons/        # Student lessons CRUD
├── tertiary-names/         # Tertiary institutions CRUD
├── tertiary-programmes/    # Tertiary programmes CRUD
├── tertiary-specializations/ # Tertiary specializations CRUD
├── tutor-job-notifications/ # Tutor notifications CRUD
├── tutor-requests/         # Tutor requests CRUD (main feature)
├── tutor-sessions-orders/  # Session orders CRUD
├── tutor-student-hours/    # Student hours CRUD
├── user-profiles/          # User profiles CRUD
├── common/dto/             # Shared DTOs (pagination, search)
├── config/                 # Database configuration
├── app.module.ts           # Main application module
└── main.ts                 # Application bootstrap
```

## 🧪 Testing

The project includes comprehensive testing setup:

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## 🚀 Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure proper CORS origins
4. Set up SSL/TLS
5. Configure database connection pooling
6. Set up monitoring and logging

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/api/docs`

## 🔄 Version History

- **v1.0.0** - Initial release with complete CRUD operations and authentication