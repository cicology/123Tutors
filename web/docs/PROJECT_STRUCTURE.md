# 📁 Project Structure

This document outlines the organized structure of the Bursary Management System.

## 🏗️ Directory Structure

\`\`\`
bursary-dashboard/
├── 📁 app/                          # Next.js App Router
│   ├── 📄 globals.css               # Global styles
│   ├── 📄 layout.tsx                # Root layout component
│   ├── 📄 page.tsx                  # Home page (authentication)
│   └── 📁 onboarding/              # Onboarding flow pages
│       └── 📄 page.tsx             # Organization setup page
│
├── 📁 components/                   # React components
│   ├── 📁 features/                # Feature-specific components
│   │   ├── 📄 bursary-dashboard.tsx # Main dashboard component
│   │   └── 📄 bursary-onboarding.tsx # Organization setup component
│   ├── 📁 forms/                   # Form components
│   │   └── 📄 auth-form.tsx        # Authentication form
│   ├── 📁 layout/                  # Layout components
│   │   └── 📄 theme-provider.tsx   # Theme context provider
│   └── 📁 ui/                      # Reusable UI components
│       ├── 📄 alert.tsx            # Alert component
│       ├── 📄 avatar.tsx           # Avatar component
│       ├── 📄 badge.tsx            # Badge component
│       ├── 📄 button.tsx           # Button component
│       ├── 📄 card.tsx             # Card component
│       ├── 📄 checkbox.tsx         # Checkbox component
│       ├── 📄 dialog.tsx           # Dialog component
│       ├── 📄 input.tsx            # Input component
│       ├── 📄 label.tsx            # Label component
│       ├── 📄 progress.tsx         # Progress component
│       ├── 📄 select.tsx           # Select component
│       ├── 📄 table.tsx            # Table component
│       └── 📄 textarea.tsx         # Textarea component
│
├── 📁 lib/                         # Utility libraries
│   ├── 📄 api-service.ts           # API service for backend calls
│   ├── 📁 types/                   # TypeScript type definitions
│   ├── 📁 hooks/                   # Custom React hooks
│   ├── 📄 supabase.ts              # Supabase client configuration
│   └── 📄 utils.ts                 # Utility functions
│
├── 📁 database/                    # Database files
│   └── 📄 database-schema.sql      # Complete database schema
│
├── 📁 scripts/                     # Build and setup scripts
│   └── 📄 setup-database.js       # Database setup and population
│
├── 📁 docs/                       # Documentation
│   ├── 📄 CONFIGURATION.md         # Environment configuration
│   ├── 📄 DATABASE_SETUP.md        # Database setup guide
│   ├── 📄 IMPLEMENTATION_SUMMARY.md # Technical implementation
│   ├── 📄 PROJECT_STRUCTURE.md    # This file
│   ├── 📄 QUICK_SETUP.md           # Quick start guide
│   ├── 📄 SETUP_INSTRUCTIONS.md   # Detailed setup instructions
│   ├── 📄 SUPABASE_SETUP.md       # Supabase configuration
│   ├── 📄 test-auth.md             # Authentication testing
│   └── 📄 VERCEL_DEPLOYMENT.md     # Deployment guide
│
├── 📁 public/                     # Static assets
│   ├── 📁 images/                 # Image assets
│   │   ├── 📄 123tutors-logo.jpg   # Company logo
│   │   └── 📄 123tutors-logo.png   # Company logo (PNG)
│   ├── 📄 abstract-geometric-shapes.jpg
│   ├── 📄 diverse-students-studying.jpg
│   ├── 📄 placeholder-logo.png
│   ├── 📄 placeholder-logo.svg
│   ├── 📄 placeholder-user.jpg
│   ├── 📄 placeholder.jpg
│   └── 📄 placeholder.svg
│
├── 📁 styles/                     # Additional styles
│   └── 📄 globals.css             # Global CSS (legacy)
│
├── 📄 components.json             # shadcn/ui configuration
├── 📄 next.config.mjs             # Next.js configuration
├── 📄 package.json                # Dependencies and scripts
├── 📄 postcss.config.mjs          # PostCSS configuration
├── 📄 README.md                   # Project documentation
├── 📄 tsconfig.json               # TypeScript configuration
└── 📄 vercel.json                 # Vercel deployment configuration
\`\`\`

## 🎯 Component Organization

### Features (`components/features/`)
Contains the main application features:
- **bursary-dashboard.tsx** - Main dashboard with all tabs and functionality
- **bursary-onboarding.tsx** - 4-step organization setup process

### Forms (`components/forms/`)
Contains form-related components:
- **auth-form.tsx** - Authentication (login/signup) form

### Layout (`components/layout/`)
Contains layout and theme components:
- **theme-provider.tsx** - Theme context and provider

### UI (`components/ui/`)
Contains reusable UI components from shadcn/ui:
- All basic UI components (buttons, inputs, cards, etc.)

## 🔧 Service Organization

### API Services (`lib/`)
Contains API and utility services:
- **api-service.ts** - API service for backend communication
- **supabase.ts** - Supabase client configuration

### Types (`lib/types/`)
Contains TypeScript type definitions (to be added):
- Database entity types
- API response types
- Component prop types

### Hooks (`lib/hooks/`)
Contains custom React hooks (to be added):
- Authentication hooks
- Data fetching hooks
- Form handling hooks

## 📊 Database Organization

### Database (`database/`)
Contains database-related files:
- **database-schema.sql** - Complete PostgreSQL schema with tables, indexes, and policies

### Scripts (`scripts/`)
Contains setup and utility scripts:
- **setup-database.js** - Automated database setup and dummy data population

## 📚 Documentation Organization

### Docs (`docs/`)
Contains comprehensive documentation:
- **CONFIGURATION.md** - Environment and configuration setup
- **DATABASE_SETUP.md** - Complete database setup guide
- **IMPLEMENTATION_SUMMARY.md** - Technical implementation overview
- **PROJECT_STRUCTURE.md** - This file
- **QUICK_SETUP.md** - Quick start guide
- **SETUP_INSTRUCTIONS.md** - Detailed setup instructions
- **SUPABASE_SETUP.md** - Supabase configuration guide
- **test-auth.md** - Authentication testing guide
- **VERCEL_DEPLOYMENT.md** - Deployment instructions

## 🚀 Benefits of This Structure

1. **Separation of Concerns** - Features, forms, and UI components are clearly separated
2. **Scalability** - Easy to add new features and components
3. **Maintainability** - Clear organization makes code easier to maintain
4. **Reusability** - UI components are easily reusable across features
5. **Documentation** - Comprehensive docs for setup and development
6. **Type Safety** - Organized TypeScript types and services
7. **Database Management** - Clear separation of database files and scripts

## 🔄 Import Patterns

### Component Imports
\`\`\`typescript
// Feature components
import { BursaryDashboard } from "@/components/features/bursary-dashboard"
import { BursaryOnboarding } from "@/components/features/bursary-onboarding"

// Form components
import { AuthForm } from "@/components/forms/auth-form"

// Layout components
import { ThemeProvider } from "@/components/layout/theme-provider"

// UI components
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
\`\`\`

### Service Imports
\`\`\`typescript
// API services
import { apiService } from "@/lib/api-service"

// Utilities
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
\`\`\`

This structure provides a clean, maintainable, and scalable foundation for the Bursary Management System.
