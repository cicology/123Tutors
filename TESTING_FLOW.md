# Complete Testing Flow - TutorFlow Application

## Overview
This document provides a comprehensive testing sequence for all functionalities in the TutorFlow tutoring platform. Follow this flow sequentially to test the entire application.

---

## Prerequisites
- ✅ Database connected and running
- ✅ Backend server running on `http://localhost:3000`
- ✅ Frontend running on `http://localhost:5173` (or configured port)
- ✅ PostgreSQL database `tutor_dashboard` created

---

## Phase 1: Authentication & User Registration

### 1.1 Student Registration
**Route:** `/student-signin` or `/signin`

**Test Steps:**
1. Navigate to sign-in page
2. Click "Register as Student" or navigate to student registration
3. Fill registration form:
   - First Name
   - Last Name
   - Email (unique)
   - Password
   - Confirm Password
4. Submit registration
5. **Expected:** Success message, redirect to student dashboard or sign-in

**Verify:**
- ✅ Student account created in database
- ✅ Can login with credentials
- ✅ JWT token received

### 1.2 Tutor Registration
**Route:** `/become-tutor` or `/tutor-signin`

**Test Steps:**
1. Navigate to "Become a Tutor" page
2. Fill tutor application form:
   - Personal information
   - Qualifications
   - Subjects/Courses
   - Upload CV (if required)
   - Availability
3. Submit application
4. **Expected:** Application submitted, status: PENDING

**Verify:**
- ✅ Tutor application created with status PENDING
- ✅ Admin can see pending application

### 1.3 Login (Student)
**Route:** `/signin` or `/student-signin`

**Test Steps:**
1. Enter registered email and password
2. Click "Sign In"
3. **Expected:** Redirect to student dashboard, JWT token stored

### 1.4 Login (Tutor)
**Route:** `/tutor-signin`

**Test Steps:**
1. Enter tutor credentials (must be approved by admin first)
2. Click "Sign In"
3. **Expected:** Redirect to tutor dashboard

**Note:** Tutors must be approved by admin before they can login.

---

## Phase 2: Admin Functions

### 2.1 Admin Login
**Route:** Admin login (check admin credentials)

**Test Steps:**
1. Login as admin (email: `admin@123tutors.co.za` or configured admin email)
2. **Expected:** Redirect to admin dashboard

### 2.2 Review Tutor Applications
**Route:** `/admin-dashboard` → Applications

**Test Steps:**
1. View pending applications
2. Review tutor details:
   - Personal information
   - Qualifications
   - CV download
3. **Expected:** List of pending applications displayed

### 2.3 Approve/Decline Tutor Application
**Route:** `/admin-dashboard` → Applications → [Application ID]

**Test Steps:**
1. Select a pending application
2. Review all details
3. Click "Approve" or "Decline"
4. **Expected:**
   - If Approved: Tutor status changes to APPROVED, tutor can now login
   - If Declined: Application status changes to DECLINED, notification sent

**Verify:**
- ✅ Tutor status updated in database
- ✅ Notification sent to tutor
- ✅ Approved tutors can login

### 2.4 Review Bursary Applications
**Route:** `/admin-dashboard` → Bursaries

**Test Steps:**
1. View pending bursary sign-ups
2. Review student information
3. Approve or decline bursary
4. **Expected:** Bursary status updated, student notified

### 2.5 Admin Dashboard Statistics
**Route:** `/admin-dashboard`

**Test Steps:**
1. View dashboard stats:
   - Total tutors
   - Total students
   - Pending applications
   - Total requests
   - Commission summary
2. **Expected:** All statistics displayed correctly

### 2.6 Admin Request Management
**Route:** `/admin-dashboard` → Requests

**Test Steps:**
1. View all course requests
2. Assign/reassign tutors to requests
3. **Expected:** Request tutor assignment updated

### 2.7 User Management
**Route:** `/admin-dashboard` → Users

**Test Steps:**
1. Search user by email
2. View user details
3. Reset user password (if needed)
4. **Expected:** User found, password reset functionality works

---

## Phase 3: Student Flow - Finding & Requesting Tutors

### 3.1 Browse Marketplace
**Route:** `/marketplace`

**Test Steps:**
1. Navigate to marketplace (may require sign-in)
2. View list of approved tutors
3. Use search/filter:
   - Subject/Course
   - Location
   - Rating
   - Price range
4. **Expected:** Filtered list of tutors displayed

**Verify:**
- ✅ Only approved tutors shown
- ✅ Search/filter works correctly
- ✅ Tutor profiles accessible

### 3.2 View Tutor Profile
**Route:** `/marketplace` → Click on tutor

**Test Steps:**
1. Click on a tutor card
2. View tutor details:
   - Name, qualifications
   - Subjects/courses
   - Ratings and reviews
   - Pricing
   - Availability
3. **Expected:** Full tutor profile displayed

### 3.3 Request a Tutor
**Route:** `/marketplace` → Select tutor → Request form

**Test Steps:**
1. Select a tutor from marketplace
2. Fill request form:
   - Course/Subject
   - Preferred schedule (days, times, duration)
   - Number of lessons
   - Service type
   - Message/Notes
3. Review calculated price
4. Confirm request
5. **Expected:**
   - If not logged in: Redirect to sign-in
   - If logged in: Request created with status PENDING
   - Redirect to student dashboard

**Verify:**
- ✅ Request created in database
- ✅ Status: PENDING
- ✅ Notification sent to tutor
- ✅ Request visible on student dashboard

### 3.4 Student Dashboard - View Requests
**Route:** `/student-dashboard`

**Test Steps:**
1. View pending requests section
2. View accepted requests section
3. View declined requests (if any)
4. **Expected:** All requests displayed with correct status

---

## Phase 4: Tutor Flow - Managing Requests

### 4.1 Tutor Dashboard Overview
**Route:** `/tutor-dashboard`

**Test Steps:**
1. Login as approved tutor
2. View dashboard:
   - Pending requests count
   - Upcoming lessons
   - Recent payments
   - Analytics summary
3. **Expected:** Dashboard data displayed correctly

### 4.2 View Pending Requests
**Route:** `/tutor-dashboard` → Requests

**Test Steps:**
1. Navigate to requests section
2. View pending requests:
   - Student name
   - Course/subject
   - Preferred schedule
   - Price
   - Message
3. **Expected:** List of pending requests displayed

### 4.3 Accept Request
**Route:** `/tutor-dashboard` → Requests → [Request ID]

**Test Steps:**
1. Select a pending request
2. Review all details
3. Click "Accept"
4. **Expected:**
   - Request status changes to ACCEPTED
   - Notification sent to student
   - Request moves to "Accepted Requests" section
   - Option to generate lessons appears

**Verify:**
- ✅ Request status updated to ACCEPTED
- ✅ Student notified
- ✅ Request visible in accepted requests

### 4.4 Decline Request
**Route:** `/tutor-dashboard` → Requests → [Request ID]

**Test Steps:**
1. Select a pending request
2. Click "Decline"
3. Optionally add reason
4. **Expected:**
   - Request status changes to DECLINED
   - Notification sent to student
   - Request removed from pending list

### 4.5 Refer Request to Another Tutor
**Route:** `/tutor-dashboard` → Requests → [Request ID]

**Test Steps:**
1. Select a pending request
2. Click "Refer"
3. Select another tutor
4. **Expected:**
   - Request status changes to REFERRED
   - Referred tutor notified
   - Student notified of referral

### 4.6 Accept Referred Request (as Referred Tutor)
**Route:** `/tutor-dashboard` → Requests

**Test Steps:**
1. Login as referred tutor
2. View referred requests
3. Accept or decline referral
4. **Expected:** Request status updated accordingly

---

## Phase 5: Payment Flow

### 5.1 Initialize Payment for Accepted Request
**Route:** Student Dashboard → Accepted Request → Pay

**Test Steps:**
1. Student views accepted request
2. Click "Pay Now" or "Initialize Payment"
3. **Expected:**
   - Payment record created
   - Paystack payment initialized
   - Redirect to Paystack payment page

**Verify:**
- ✅ Payment record created with status PENDING
- ✅ Paystack integration works
- ✅ Payment amount correct

### 5.2 Complete Payment (Paystack)
**Test Steps:**
1. On Paystack page, use test card:
   - Card: `4084084084084081`
   - CVV: `408`
   - Expiry: Any future date
   - PIN: `0000`
2. Complete payment
3. **Expected:**
   - Payment verified
   - Status updated to COMPLETED
   - Redirect to success page
   - Notification sent

**Verify:**
- ✅ Payment status: COMPLETED
- ✅ Paystack reference stored
- ✅ Student can proceed to schedule lessons

### 5.3 View Payment History (Student)
**Route:** Student Dashboard → Payments

**Test Steps:**
1. View payment history
2. Filter by status
3. **Expected:** All payments displayed with correct status

### 5.4 View Payment Requests (Tutor)
**Route:** `/tutor-payments`

**Test Steps:**
1. View payment requests
2. View payment summary:
   - Total earnings
   - Pending payments
   - Commission breakdown
3. **Expected:** Payment data displayed correctly

### 5.5 Request Payment (Tutor)
**Route:** `/tutor-payments` → Request Payment

**Test Steps:**
1. Enter amount
2. Add notes (optional)
3. Submit request
4. **Expected:** Payment request created, pending admin approval

---

## Phase 6: Lesson Management

### 6.1 Generate Lessons from Accepted Request
**Route:** Tutor Dashboard → Accepted Requests → Generate Lessons

**Test Steps:**
1. Select an accepted request (with completed payment)
2. Click "Generate Lessons"
3. System uses preferred schedule from request
4. **Expected:**
   - Lessons created based on schedule
   - Lessons visible in tutor's lesson list
   - Student notified

**Verify:**
- ✅ Lessons created with correct:
  - Schedule (days, times)
  - Duration
  - Student and tutor assignment
  - Status: SCHEDULED

### 6.2 View Lessons (Tutor)
**Route:** `/tutor-lessons`

**Test Steps:**
1. View all lessons
2. Filter by:
   - Status (scheduled, completed, cancelled)
   - Date range
   - Student
3. View calendar view
4. **Expected:** Lessons displayed correctly

### 6.3 View Lessons (Student)
**Route:** Student Dashboard → Lessons

**Test Steps:**
1. View upcoming lessons
2. View lesson calendar
3. **Expected:** Student's lessons displayed

### 6.4 Create Manual Lesson (Tutor)
**Route:** `/tutor-lessons` → Create Lesson

**Test Steps:**
1. Click "Create Lesson"
2. Fill form:
   - Student (from existing students)
   - Subject/Course
   - Date and time
   - Duration
   - Type (Online/In-person)
   - Notes
3. Submit
4. **Expected:** Lesson created and scheduled

**Verify:**
- ✅ Weekly limit enforced (2 sessions per week for weekday students)
- ✅ Saturday lessons unlimited
- ✅ Conflict checking works

### 6.5 Reschedule Lesson
**Route:** `/tutor-lessons` → [Lesson ID] → Reschedule

**Test Steps:**
1. Select a scheduled lesson
2. Click "Reschedule"
3. Select new date/time
4. Confirm
5. **Expected:**
   - Lesson rescheduled
   - Both parties notified
   - Calendar updated

### 6.6 Cancel Lesson
**Route:** `/tutor-lessons` → [Lesson ID] → Cancel

**Test Steps:**
1. Select a lesson
2. Click "Cancel"
3. Add reason (optional)
4. Confirm
5. **Expected:**
   - Lesson status: CANCELLED
   - Notification sent
   - Lesson removed from upcoming list

### 6.7 Start Lesson Session
**Route:** `/tutor-lessons` → [Lesson ID] → Start Session

**Test Steps:**
1. At scheduled time, click "Start Session"
2. **Expected:**
   - Lesson status: IN_PROGRESS
   - Start time recorded
   - Timer begins (if implemented)

### 6.8 End Lesson Session
**Route:** `/tutor-lessons` → [Lesson ID] → End Session

**Test Steps:**
1. After lesson, click "End Session"
2. Enter actual duration (if different)
3. Add notes (optional)
4. **Expected:**
   - Lesson status: COMPLETED
   - End time recorded
   - Actual duration saved
   - Payment request auto-created (if applicable)
   - Student notified

**Verify:**
- ✅ Payment record created automatically
- ✅ Payment amount calculated correctly
- ✅ Commission calculated

---

## Phase 7: Reviews & Ratings

### 7.1 Submit Review (Student)
**Route:** Student Dashboard → Completed Lessons → Review

**Test Steps:**
1. After lesson completion, navigate to review section
2. Select completed lesson
3. Rate tutor (1-5 stars)
4. Write review text
5. Submit
6. **Expected:**
   - Review saved
   - Tutor rating updated
   - Review visible on tutor profile

**Verify:**
- ✅ Review appears on tutor's profile
- ✅ Average rating recalculated
- ✅ Review visible in marketplace

### 7.2 View Reviews (Tutor)
**Route:** `/tutor-reviews`

**Test Steps:**
1. View all reviews received
2. View rating statistics:
   - Average rating
   - Total reviews
   - Rating distribution
3. **Expected:** Reviews and stats displayed

---

## Phase 8: Messaging/Chat

### 8.1 Initiate Chat (Student)
**Route:** Student Dashboard → Messages or Tutor Profile → Message

**Test Steps:**
1. Click "Message Tutor" on tutor profile
2. Or navigate to messages section
3. **Expected:** Chat interface opens

### 8.2 Send Message
**Test Steps:**
1. Type message
2. Send
3. **Expected:**
   - Message sent
   - Appears in chat history
   - Recipient notified

### 8.3 View Messages (Tutor)
**Route:** `/tutor-chats`

**Test Steps:**
1. View all conversations
2. Select a conversation
3. View message history
4. Reply to messages
5. **Expected:** Chat functionality works for both parties

**Verify:**
- ✅ Real-time or near-real-time messaging
- ✅ Unread message indicators
- ✅ Message history preserved

---

## Phase 9: Courses Management

### 9.1 Create Course (Tutor)
**Route:** `/tutor-courses` → Create Course

**Test Steps:**
1. Click "Create Course"
2. Fill form:
   - Course name
   - Description
   - Subject
   - Price
   - Duration
   - Level
3. Submit
4. **Expected:** Course created and visible in tutor's course list

### 9.2 Update Course
**Route:** `/tutor-courses` → [Course ID] → Edit

**Test Steps:**
1. Select a course
2. Click "Edit"
3. Update details
4. Save
5. **Expected:** Course updated

### 9.3 Delete Course
**Route:** `/tutor-courses` → [Course ID] → Delete

**Test Steps:**
1. Select a course
2. Click "Delete"
3. Confirm deletion
4. **Expected:** Course deleted (check for constraints)

---

## Phase 10: Referrals

### 10.1 Generate Referral Code (Tutor)
**Route:** `/tutor-referrals` → Generate Code

**Test Steps:**
1. Click "Generate Referral Code"
2. **Expected:**
   - Unique referral code generated
   - Code displayed
   - Code can be shared

### 10.2 View Referral Stats
**Route:** `/tutor-referrals`

**Test Steps:**
1. View referral statistics:
   - Total referrals
   - Successful referrals
   - Earnings from referrals
2. **Expected:** Stats displayed correctly

### 10.3 Use Referral Code (Student)
**Test Steps:**
1. During registration or request, enter referral code
2. **Expected:** Referral tracked, tutor credited

---

## Phase 11: Analytics

### 11.1 View Tutor Analytics
**Route:** `/tutor-analytics`

**Test Steps:**
1. View analytics dashboard:
   - Total students
   - Total lessons
   - Earnings
   - Monthly trends
   - Popular courses
2. **Expected:** Analytics data displayed correctly

### 11.2 Monthly Analytics
**Route:** `/tutor-analytics` → Monthly View

**Test Steps:**
1. Select month/year
2. View monthly breakdown
3. **Expected:** Monthly statistics displayed

---

## Phase 12: Notifications

### 12.1 View Notifications (Tutor)
**Route:** Tutor Dashboard → Notifications

**Test Steps:**
1. View notification list
2. Check unread count
3. Mark notifications as read
4. **Expected:** Notifications displayed, unread count accurate

### 12.2 View Notifications (Student)
**Route:** Student Dashboard → Notifications

**Test Steps:**
1. View notification list
2. Check unread count
3. Mark as read
4. **Expected:** Notifications displayed correctly

**Verify Notification Triggers:**
- ✅ Request accepted/declined
- ✅ Payment completed
- ✅ Lesson scheduled/rescheduled/cancelled
- ✅ New message
- ✅ Review received
- ✅ Referral used

---

## Phase 13: Settings & Profile

### 13.1 Update Tutor Profile
**Route:** `/tutor-settings`

**Test Steps:**
1. Update profile information:
   - Personal details
   - Qualifications
   - Subjects
   - Availability
   - Pricing
2. Save changes
3. **Expected:** Profile updated, changes reflected

### 13.2 Update Student Profile
**Route:** `/student-settings`

**Test Steps:**
1. Update personal information
2. Update preferences
3. Save
4. **Expected:** Profile updated

---

## Phase 14: Bursary Sign-up

### 14.1 Student Bursary Application
**Route:** `/bursary-signup`

**Test Steps:**
1. Fill bursary application form
2. Submit
3. **Expected:**
   - Application submitted
   - Status: PENDING
   - Admin notified

### 14.2 Admin Bursary Approval
**Route:** Admin Dashboard → Bursaries

**Test Steps:**
1. Review bursary application
2. Approve or decline
3. **Expected:**
   - Status updated
   - Student notified
   - Bursary benefits activated (if approved)

---

## Phase 15: Error Handling & Edge Cases

### 15.1 Test Error Scenarios
**Test Steps:**
1. **Invalid login credentials:** Should show error message
2. **Duplicate email registration:** Should prevent registration
3. **Unauthorized access:** Should redirect to login
4. **Invalid payment:** Should handle gracefully
5. **Lesson conflict:** Should prevent double-booking
6. **Missing required fields:** Should show validation errors

### 15.2 Test Edge Cases
**Test Steps:**
1. **Cancel lesson after payment:** Check refund logic
2. **Multiple requests from same student:** Should handle correctly
3. **Tutor with no reviews:** Should display gracefully
4. **Empty states:** Dashboard with no data
5. **Large data sets:** Pagination works
6. **Concurrent requests:** System handles multiple users

---

## Phase 16: Integration Testing

### 16.1 Complete End-to-End Flow
**Test the complete journey:**

1. **Student Journey:**
   - Register → Browse marketplace → Request tutor → Make payment → Attend lessons → Review tutor

2. **Tutor Journey:**
   - Apply → Get approved → Receive requests → Accept request → Generate lessons → Conduct lessons → Receive payment

3. **Admin Journey:**
   - Review applications → Approve tutors → Manage requests → View analytics

### 16.2 Cross-Feature Testing
**Test interactions between features:**
- Request → Payment → Lessons flow
- Lesson completion → Payment generation
- Review submission → Rating update
- Referral code → Registration → Credit

---

## Verification Checklist

### Backend API Endpoints
- [ ] All authentication endpoints work
- [ ] All CRUD operations work
- [ ] Authorization guards work correctly
- [ ] Error handling returns proper status codes
- [ ] Database transactions work correctly

### Frontend Pages
- [ ] All routes accessible
- [ ] Forms submit correctly
- [ ] Data displays correctly
- [ ] Navigation works
- [ ] Responsive design works

### Database
- [ ] All tables created
- [ ] Relationships work correctly
- [ ] Constraints enforced
- [ ] Data integrity maintained

### Integrations
- [ ] Paystack payment integration works
- [ ] Email notifications sent (if implemented)
- [ ] File uploads work (CV, profile pictures)

---

## Known Issues & Limitations

Based on `FLOW_IMPLEMENTATION_STATUS.md`:

### ⚠️ Needs Verification:
1. DECLINED status display on student dashboard
2. Sign-in redirect after price confirmation
3. Pending booking submission after login

### ❌ Not Yet Implemented:
1. Admin request assignment/reassignment
2. Escalation after 24 hours
3. Calendar invitations
4. Session reminders
5. Advanced payment features

---

## Testing Tools & Tips

### Recommended Tools:
1. **Postman/Insomnia:** For API testing
2. **Browser DevTools:** For frontend debugging
3. **pgAdmin/psql:** For database verification
4. **Network tab:** To monitor API calls

### Test Data:
- Create multiple test accounts (students, tutors)
- Use realistic test data
- Test with different user roles
- Test edge cases and boundary conditions

### Best Practices:
1. Test one feature at a time
2. Document any bugs found
3. Test on different browsers
4. Test responsive design
5. Verify database state after operations
6. Check console for errors
7. Verify notifications are sent

---

## Conclusion

This testing flow covers all major functionalities of the TutorFlow application. Follow this sequence to ensure comprehensive testing. Document any issues found and verify fixes before moving to the next phase.

**Note:** Some features may require additional setup (e.g., Paystack API keys, email service configuration). Ensure all integrations are properly configured before testing those features.



