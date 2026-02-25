# Bursary Dashboard with Supabase Authentication

This project uses Supabase for authentication. Follow these steps to set up Supabase authentication:

## Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and anon key

2. **Configure Environment Variables**
   - Copy `.env.local.example` to `.env.local`
   - Replace the placeholder values with your actual Supabase credentials:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your-actual-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-supabase-anon-key
   \`\`\`

3. **Enable Email Authentication**
   - In your Supabase dashboard, go to Authentication > Settings
   - Enable "Email" provider
   - Configure email templates if needed

4. **Set up Email Templates (Optional)**
   - Go to Authentication > Email Templates
   - Customize the "Confirm your signup" template
   - Set up SMTP settings for production

## Features Implemented

- ✅ User registration with email verification
- ✅ User login with email/password
- ✅ Persistent authentication state
- ✅ Automatic logout functionality
- ✅ Form validation
- ✅ Error handling and success messages
- ✅ Loading states

## Running the Application

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set up your `.env.local` file with Supabase credentials

3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Testing Authentication

1. **Sign Up**: Create a new account with a valid email address
2. **Email Verification**: Check your email and click the verification link
3. **Sign In**: Use your credentials to log in
4. **Dashboard Access**: Once authenticated, you'll see the bursary dashboard
5. **Sign Out**: Use the logout button to sign out

## Notes

- The application will show a loading spinner while checking authentication state
- Users must verify their email before they can sign in
- Authentication state persists across browser sessions
- All authentication is handled securely through Supabase
