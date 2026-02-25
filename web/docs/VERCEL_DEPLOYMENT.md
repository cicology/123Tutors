# Vercel Deployment Guide

## Environment Variables Setup for Vercel

To deploy your Bursary Dashboard with Supabase authentication to Vercel, you need to configure the environment variables in your Vercel project.

### Step 1: Deploy to Vercel

1. **Connect your repository to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your repository

2. **Configure Environment Variables:**
   - In your Vercel project dashboard, go to **Settings** → **Environment Variables**
   - Add the following variables:

   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL = https://tzkeexmdlhguydmsbykt.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_8_41Nlmi6YmIyG1le0InWA_Cq6hXEUN
   \`\`\`

3. **Deploy:**
   - Click "Deploy" or push changes to trigger automatic deployment
   - Vercel will build and deploy your application

### Step 2: Verify Deployment

1. **Check Environment Variables:**
   - In Vercel dashboard → Settings → Environment Variables
   - Ensure both variables are set correctly
   - Make sure they're available for all environments (Production, Preview, Development)

2. **Test Authentication:**
   - Visit your deployed URL
   - Try signing up with a new account
   - Check email for verification link
   - Test login functionality

### Important Notes

- ✅ **Environment variables are secure** - Vercel handles them properly
- ✅ **Automatic deployments** - Changes to your repo trigger new deployments
- ✅ **Preview deployments** - Each PR gets its own preview URL
- ✅ **Environment isolation** - Variables are scoped to your project

### Troubleshooting

If authentication doesn't work after deployment:

1. **Check Vercel logs:**
   - Go to your project → Functions → View Function Logs
   - Look for any Supabase connection errors

2. **Verify Supabase settings:**
   - In Supabase dashboard → Settings → API
   - Ensure your domain is added to allowed origins
   - Check that email authentication is enabled

3. **Test locally first:**
   - Make sure authentication works on `localhost:3000`
   - Then deploy to Vercel

### Supabase Configuration for Production

In your Supabase dashboard:

1. **Authentication → Settings:**
   - Enable "Email" provider
   - Add your Vercel domain to "Site URL"
   - Add your Vercel domain to "Redirect URLs"

2. **Authentication → URL Configuration:**
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

Your application is now ready for production deployment! 🚀
