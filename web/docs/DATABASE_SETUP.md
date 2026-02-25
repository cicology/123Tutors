# Database Setup Guide for Bursary Management System

## 🗄️ **Database Schema Overview**

The bursary management system uses the following Supabase tables:

### Core Tables:
1. **organizations** - Bursary organization details
2. **budget_settings** - Budget configuration and limits
3. **students** - Student information and budget tracking
4. **courses** - Course offerings and budget allocation
5. **lessons** - Individual tutoring sessions
6. **tutoring_requests** - Student requests for tutoring
7. **invoices** - Monthly billing and payment tracking

### Supporting Tables:
8. **eligible_universities** - Universities eligible for bursary
9. **eligible_study_fields** - Study fields covered by bursary
10. **student_criteria** - Eligibility criteria and limits
11. **student_course_enrollments** - Many-to-many relationship
12. **user_profiles** - Extended user information

## 🚀 **Setup Instructions**

### Step 1: Create Database Schema

1. **Open Supabase Dashboard:**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor**

2. **Run the Schema Script:**
   - Copy the contents of `database-schema.sql`
   - Paste into the SQL Editor
   - Click **Run** to execute

3. **Verify Tables Created:**
   - Go to **Table Editor**
   - Confirm all 12 tables are created
   - Check that Row Level Security (RLS) is enabled

### Step 2: Test Database Integration

1. **Start Development Server:**
   \`\`\`bash
   npm run dev
   \`\`\`

2. **Test Onboarding Flow:**
   - Navigate to `/onboarding` (if you have this route)
   - Complete the 4-step organization setup
   - Verify data is saved to database

3. **Test Dashboard Data:**
   - Login to the dashboard
   - Check that data loads from database
   - Test CRUD operations

## 📊 **Database Service Functions**

The `lib/database.ts` file provides service functions for:

### Organization Management:
\`\`\`typescript
// Create organization
await organizationService.createOrganization(data)

// Get organization by user
await organizationService.getOrganizationByUserId(userId)

// Update organization
await organizationService.updateOrganization(id, updates)
\`\`\`

### Student Management:
\`\`\`typescript
// Get all students
await studentService.getStudents(organizationId)

// Create new student
await studentService.createStudent(organizationId, data)

// Get student analytics
await studentService.getStudentAnalytics(studentId)
\`\`\`

### Course Management:
\`\`\`typescript
// Get all courses
await courseService.getCourses(organizationId)

// Create new course
await courseService.createCourse(organizationId, data)

// Get course students
await courseService.getCourseStudents(courseId)
\`\`\`

### Request Management:
\`\`\`typescript
// Get all requests
await requestService.getRequests(organizationId)

// Create new request
await requestService.createRequest(organizationId, data)

// Update request status
await requestService.updateRequestStatus(id, status, processedBy)
\`\`\`

### Lesson Management:
\`\`\`typescript
// Get lessons with filters
await lessonService.getLessons(organizationId, { year: '2024', month: '1' })

// Create new lesson
await lessonService.createLesson(organizationId, data)

// Update lesson
await lessonService.updateLesson(id, updates)
\`\`\`

### Analytics:
\`\`\`typescript
// Get dashboard statistics
await analyticsService.getDashboardStats(organizationId)

// Get top students by budget
await analyticsService.getTopStudentsByBudget(organizationId, 3)
\`\`\`

## 🔒 **Security Features**

### Row Level Security (RLS):
- Users can only access data from their own organization
- Automatic filtering based on authenticated user
- Secure data isolation between organizations

### Authentication Integration:
- All tables linked to authenticated users
- Automatic user_id population
- Secure user context in all queries

## 🧪 **Testing Checklist**

### Database Setup:
- [ ] All 12 tables created successfully
- [ ] RLS policies applied correctly
- [ ] Triggers for updated_at timestamps working
- [ ] Indexes created for performance

### Onboarding Flow:
- [ ] Organization creation works
- [ ] Budget settings saved correctly
- [ ] Eligible universities/fields stored
- [ ] Student criteria configured
- [ ] Contact information saved

### Dashboard Integration:
- [ ] Students data loads from database
- [ ] Courses data loads from database
- [ ] Requests data loads from database
- [ ] Lessons data loads from database
- [ ] Analytics calculations work correctly

### CRUD Operations:
- [ ] Create new students
- [ ] Update student information
- [ ] Create tutoring requests
- [ ] Approve/reject requests
- [ ] Add new lessons
- [ ] Generate invoices

## 🚨 **Troubleshooting**

### Common Issues:

1. **RLS Policy Errors:**
   - Check user authentication
   - Verify organization_id relationships
   - Ensure policies are correctly applied

2. **Foreign Key Constraints:**
   - Verify organization exists before creating related records
   - Check user_id references in auth.users

3. **Data Type Errors:**
   - Ensure numeric fields receive numbers
   - Check date formats for timestamp fields
   - Validate enum values for constrained fields

### Debug Steps:

1. **Check Supabase Logs:**
   - Go to Logs → API
   - Look for error messages
   - Check authentication status

2. **Test Queries Manually:**
   - Use SQL Editor to test queries
   - Verify data relationships
   - Check RLS policies

3. **Browser Console:**
   - Check for JavaScript errors
   - Verify API calls are made
   - Check response data

## 📈 **Performance Optimization**

### Indexes Created:
- `idx_organizations_user_id`
- `idx_students_organization_id`
- `idx_courses_organization_id`
- `idx_lessons_organization_id`
- `idx_lessons_student_id`
- `idx_lessons_date`
- `idx_tutoring_requests_organization_id`
- `idx_tutoring_requests_student_id`
- `idx_invoices_organization_id`

### Query Optimization:
- Use select() to limit returned columns
- Apply filters at database level
- Use pagination for large datasets
- Leverage Supabase's built-in caching

## 🎯 **Next Steps**

1. **Complete Dashboard Integration:**
   - Update all dashboard components to use database services
   - Replace mock data with real database queries
   - Implement real-time updates

2. **Add Advanced Features:**
   - Real-time notifications
   - Advanced reporting
   - Data export functionality
   - Audit logging

3. **Performance Monitoring:**
   - Monitor query performance
   - Optimize slow queries
   - Implement caching strategies

Your database is now ready for the bursary management system! 🎉
