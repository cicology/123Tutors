# 🎓 Bursary Management System

A comprehensive bursary management platform built with Next.js, Supabase, and TypeScript for managing educational funding programs.

## 🚀 Features

- **User Authentication** - Secure login/signup with Supabase Auth
- **Organization Management** - Multi-tenant bursary organization setup
- **Student Management** - Track students, budgets, and academic progress
- **Course Management** - Manage courses and enrollments
- **Tutoring Requests** - Handle student tutoring requests
- **Lesson Tracking** - Record and track tutoring sessions
- **Financial Management** - Budget tracking and invoice generation
- **Analytics Dashboard** - Real-time insights and reporting

## 📁 Project Structure

\`\`\`
bursary-dashboard/
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── onboarding/              # Onboarding pages
│       └── page.tsx
├── components/                   # React components
│   ├── features/                # Feature-specific components
│   │   ├── bursary-dashboard.tsx
│   │   └── bursary-onboarding.tsx
│   ├── forms/                   # Form components
│   │   └── auth-form.tsx
│   ├── layout/                  # Layout components
│   │   └── theme-provider.tsx
│   └── ui/                      # Reusable UI components
│       ├── alert.tsx
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
├── lib/                         # Utility libraries
│   ├── services/                # Database services
│   │   ├── database.ts
│   │   └── db-init.ts
│   ├── types/                   # TypeScript type definitions
│   ├── hooks/                   # Custom React hooks
│   ├── supabase.ts              # Supabase client
│   └── utils.ts                 # Utility functions
├── database/                    # Database files
│   └── database-schema.sql     # Database schema
├── scripts/                     # Build and setup scripts
│   └── setup-database.js       # Database setup script
├── docs/                       # Documentation
│   ├── DATABASE_SETUP.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── QUICK_SETUP.md
│   └── ...
└── public/                     # Static assets
    ├── images/
    └── ...
\`\`\`

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL with Row Level Security
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Supabase account

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd bursary-dashboard
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Add your Supabase credentials:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   \`\`\`

4. **Set up the database**
   - Open Supabase dashboard
   - Go to SQL Editor
   - Copy and run `database/database-schema.sql`
   - Run `node scripts/setup-database.js` to populate with dummy data

5. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

The system uses 12 main tables:

- **organizations** - Bursary organization details
- **students** - Student information and budget tracking
- **courses** - Course offerings and enrollment
- **lessons** - Individual tutoring sessions
- **tutoring_requests** - Student requests for tutoring
- **invoices** - Monthly billing and payments
- **budget_settings** - Organization budget configuration
- **eligible_universities** - University eligibility
- **eligible_study_fields** - Study field eligibility
- **student_criteria** - Eligibility criteria
- **student_course_enrollments** - Many-to-many relationships
- **user_profiles** - Extended user information

## 🔧 Development

### Available Scripts

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
\`\`\`

### Database Services

The `lib/services/database.ts` file provides comprehensive database operations:

\`\`\`typescript
// Organization management
await organizationService.createOrganization(data)
await organizationService.getOrganizationByUserId(userId)

// Student management
await studentService.getStudents(organizationId)
await studentService.createStudent(organizationId, data)

// Analytics
await analyticsService.getDashboardStats(organizationId)
\`\`\`

## 🔒 Security

- **Row Level Security (RLS)** - Data isolation between organizations
- **Authentication Required** - All operations require valid user
- **Input Validation** - Type checking and constraints
- **Secure Relationships** - Foreign keys prevent orphaned records

## 📱 Features Overview

### Authentication
- Secure signup/login with email verification
- Password reset functionality
- Session management

### Organization Setup
- 4-step onboarding process
- Organization details and contact information
- Budget configuration and limits
- Student eligibility criteria
- Terms and privacy acceptance

### Dashboard
- Real-time statistics and analytics
- Student management and tracking
- Course enrollment and progress
- Tutoring request processing
- Financial reporting and invoicing

## 🚀 Deployment

### Vercel Deployment

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on push to main branch**

See `docs/VERCEL_DEPLOYMENT.md` for detailed instructions.

## 📚 Documentation

- [Database Setup](docs/DATABASE_SETUP.md) - Complete database setup guide
- [Quick Setup](docs/QUICK_SETUP.md) - Fast setup instructions
- [Implementation Summary](docs/IMPLEMENTATION_SUMMARY.md) - Technical overview
- [Supabase Setup](docs/SUPABASE_SETUP.md) - Supabase configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation in the `docs/` folder
- Review the database schema in `database/database-schema.sql`
- Run the setup script: `node scripts/setup-database.js`

## 🎯 Roadmap

- [ ] Real-time notifications
- [ ] Advanced reporting and analytics
- [ ] Mobile app development
- [ ] Integration with learning management systems
- [ ] Automated invoice generation
- [ ] Multi-language support

---

Built with ❤️ for educational excellence
