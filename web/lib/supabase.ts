import { createClient } from '@supabase/supabase-js'

// Ensure environment variables are loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please check your .env.local file.')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Please check your .env.local file.')
}

// Log to verify (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase URL loaded:', supabaseUrl ? '✓' : '✗')
  console.log('Supabase Key loaded:', supabaseAnonKey ? '✓' : '✗')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database connection string for direct PostgreSQL access
export const DATABASE_URL = process.env.DATABASE_URL || ''
