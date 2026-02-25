# 🚀 Quick Database Setup Guide

## Step 1: Create Database Tables

1. **Open Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Select your project: `tzkeexmdlhguydmsbykt`

2. **Run SQL Schema:**
   - Click on **SQL Editor** in the left sidebar
   - Copy the entire contents of `database-schema.sql`
   - Paste it into the SQL Editor
   - Click **Run** to execute

3. **Verify Tables Created:**
   - Go to **Table Editor**
   - You should see 12 tables created:
     - organizations
     - budget_settings
     - students
     - courses
     - lessons
     - tutoring_requests
     - invoices
     - eligible_universities
     - eligible_study_fields
     - student_criteria
     - student_course_enrollments
     - user_profiles

## Step 2: Populate with Dummy Data

1. **Install Node.js dependencies:**
   \`\`\`bash
   npm install @supabase/supabase-js
   \`\`\`

2. **Run the setup script:**
   \`\`\`bash
   node setup-database.js
   \`\`\`

3. **Verify data populated:**
   - Check the **Table Editor** again
   - You should see data in the tables
   - Organizations table should have 1 record
   - Students table should have 5 records
   - Courses table should have 5 records
   - And so on...

## Step 3: Test Your Application

1. **Start the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

2. **Test the application:**
   - Open http://localhost:3000
   - Sign up for a new account
   - Complete the onboarding process
   - Access the dashboard with real data

## 🎯 What You'll See

### Dashboard Statistics:
- **Active Students:** 5
- **Total Budget:** R1,500,000
- **Budget Used:** R26,000
- **Pending Requests:** 3

### Sample Data Includes:
- **5 Students** from different universities
- **5 Courses** across different subjects
- **3 Tutoring Requests** with different urgency levels
- **3 Completed Lessons** with ratings and feedback
- **2 Invoices** for different months

## 🔧 Troubleshooting

### If tables don't exist:
- Make sure you ran the SQL schema in Supabase SQL Editor
- Check for any SQL errors in the editor

### If dummy data doesn't populate:
- Ensure tables were created successfully
- Check that the Supabase connection is working
- Verify your API keys are correct

### If app doesn't load data:
- Check browser console for errors
- Verify authentication is working
- Ensure environment variables are set

## ✅ Success Indicators

You'll know everything is working when:
- ✅ Tables are created in Supabase
- ✅ Dummy data populates successfully
- ✅ App loads without errors
- ✅ Dashboard shows real statistics
- ✅ You can sign up and login
- ✅ Onboarding process works

## 🎉 You're Ready!

Your bursary management system now has:
- Complete database schema
- Sample data for testing
- Working authentication
- Real-time data display

The system is ready for development and testing! 🚀
