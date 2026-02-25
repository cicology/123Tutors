# 🔧 Configuration Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tzkeexmdlhguydmsbykt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_8_41Nlmi6YmIyG1le0InWA_Cq6hXEUN

# Database Connection (for direct PostgreSQL access if needed)
DATABASE_URL=postgresql://postgres:123DbP@ssW0@db.tzkeexmdlhguydmsbykt.supabase.co:5432/postgres

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Bursary Management System
\`\`\`

## Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `DATABASE_URL` | Direct PostgreSQL connection string | Optional |
| `NEXT_PUBLIC_APP_URL` | Application URL for development | Optional |
| `NEXT_PUBLIC_APP_NAME` | Application name | Optional |

## Setup Instructions

1. **Copy the environment template:**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. **Update with your values:**
   - Replace the Supabase URL and key with your actual values
   - Update the database URL if using a different database

3. **Verify configuration:**
   \`\`\`bash
   npm run dev
   \`\`\`

## Security Notes

- Never commit `.env.local` to version control
- Use different keys for development and production
- Rotate keys regularly for security
- Use environment-specific configurations for different deployments
