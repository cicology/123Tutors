# Entity Relationship Diagram (ERD) - 123Tutors Dashboard Backend

This document provides a comprehensive overview of the database schema, including all entities, their attributes, and relationships.

## Table of Contents

- [Core Entities](#core-entities)
- [Reference/Lookup Entities](#referencelookup-entities)
- [Relationship Summary](#relationship-summary)
- [Entity Details](#entity-details)

---

## Core Entities

### 1. BursaryName (bursary_names)

**Primary Key:** `uniqueId` (string)

**Attributes:**
- `bursaryName` (unique, string) - Name of the bursary organization
- `address` (text) - Physical address
- `logo` (text) - Logo URL/path
- `description` (text) - Description of the bursary
- `email`, `phone`, `website` (strings) - Contact information
- `totalStudents` (int, default: 0) - Total number of students
- `totalBudget` (decimal, precision: 15, scale: 2) - Total budget allocated
- `yearEstablished` (int) - Year the bursary was established
- `programsOffered` (int, default: 0) - Number of programs offered
- `primaryColor`, `secondaryColor` (varchar) - Brand colors
- `slug`, `creator` (strings) - Metadata fields
- `creationDate`, `modifiedDate` (timestamps) - Audit timestamps

**Relationships:**
- **One-to-Many** with `BursaryStudent` (via `bursaryName`)
- **One-to-Many** with `TutorRequest` (via `bursaryName`)
- **One-to-Many** with `UserProfile` (via `bursaryName`)

---

### 2. BursaryStudent (bursary_students)

**Primary Key:** `uniqueId` (string)

**Attributes:**
- `bursary` (string) - Foreign key to BursaryName.bursaryName
- `studentEmail` (string) - Student's email address
- `studentNameAndSurname` (string) - Full name
- `studentDisallowed` (boolean, default: false) - Disallowed status
- `year` (int) - Academic year
- `university`, `course` (strings) - Educational details
- `studentIdNumber`, `phoneNumber`, `address` (strings) - Personal information
- `enrollmentDate` (date) - Date of enrollment
- `status` (string) - Current status
- `budget` (decimal, precision: 10, scale: 2) - Allocated budget
- `slug`, `creator` (strings) - Metadata fields
- `creationDate`, `modifiedDate` (timestamps) - Audit timestamps

**Relationships:**
- **Many-to-One** with `BursaryName` (via `bursary` → `bursaryName`)

---

### 3. UserProfile (user_profiles)

**Primary Key:** `email` (string)

**Attributes:**
- `uniqueId` (unique, string) - Unique identifier
- `userType` (string, default: 'user') - Type of user
- `bursaryName` (string) - Foreign key to BursaryName.bursaryName
- `profileImageUrl` (string) - Profile image URL
- `slug`, `creator` (strings) - Metadata fields
- `creationDate`, `modifiedDate` (timestamps) - Audit timestamps

**Relationships:**
- **Many-to-One** with `BursaryName` (via `bursaryName` → `bursaryName`)

---

### 4. Course (courses)

**Primary Key:** `uniqueId` (string)

**Attributes:**
- `instituteName` (string) - Name of the institute
- `moduleCodeNameSearch` (string) - Searchable module code and name
- `moduleDescription` (text) - Course description
- `moduleYear` (int) - Year of the module
- `moduleCode`, `moduleName` (strings) - Module identification
- `skillCategory`, `skillName`, `subjectName` (strings) - Classification
- `moduleLevel` (string) - Level of the module
- `moduleCredits` (int) - Credit value
- `slug`, `creator` (strings) - Metadata fields
- `creationDate`, `modifiedDate` (timestamps) - Audit timestamps

---

### 5. Lesson (lessons)

**Primary Key:** `uniqueId` (string)

**Attributes:**
- `title` (string) - Lesson title
- `description` (text) - Lesson description
- `courseId` (string) - Foreign key to Course.uniqueId
- `courseName` (string) - Course name (denormalized)
- `duration` (int) - Duration in minutes
- `studentsEnrolled` (int, default: 0) - Number of enrolled students
- `completionRate` (decimal, precision: 5, scale: 2, default: 0) - Completion percentage
- `status` (enum: 'published', 'draft', 'archived') - Lesson status
- `lessonDate` (timestamp) - Scheduled date/time
- `lessonLocation`, `lessonType` (strings) - Location and type (online/in-person/hybrid)
- `instructorName` (string) - Instructor name
- `maxStudents` (int) - Maximum enrollment
- `price` (decimal, precision: 10, scale: 2) - Lesson price
- `bursaryName`, `createdBy` (strings) - Metadata
- `slug`, `creator` (strings) - Metadata fields
- `creationDate`, `modifiedDate` (timestamps) - Audit timestamps

**Relationships:**
- **Many-to-One** with `Course` (via `courseId` → `uniqueId`)

---

### 6. TutorRequest (tutor_requests)

**Primary Key:** `uniqueId` (string)

**Attributes:**

**Address Fields:**
- `addressCity`, `addressCountry`, `addressFull`, `addressProvince`, `addressSuburbTown`, `streetAddress`

**Course Allocation:**
- `allCoursesAllocated`, `coursesAllocatedNumber`, `requestCourses`, `requestCoursesUnallocated`, `requestAvailableCoursesRequestIdList`

**Bursary Information:**
- `bursaryName` (FK), `bursaryEmail`, `bursaryPhone`, `bursaryClientRequestAutoApproved`, `bursaryDebt`

**Contact Information:**
- `contactComments`, `contactSales`, `contactedSalesBoolean`, `contactedType`

**Financial Fields:**
- `credited`, `eftPaid`, `totalAmount`, `platformFee`, `refundAmount`, `refundReason`, `refunded`

**Tutoring Requirements:**
- `extraTutoringRequirements`, `hourlyRateListText`, `hoursListText`

**Installment Payment:**
- `installmentPayment`, `installmentR`, `installment1Paid`, `installment2Paid`, `installment3Paid`, `installmentPaidUp`

**Institute Information:**
- `instituteName` (FK), `instituteCode`, `instituteProgramme`, `instituteSpecialization`, `instituteStudentYearOfStudy`

**Invoice:**
- `invoiceNumber`

**Language:**
- `language1Main`, `language2Other`, `learningType`

**Marketing:**
- `marketingMemePageInfluencer`, `marketingFeedback`, `marketingFeedbackOther`

**Request Status:**
- `newSystemRequest`, `notInterested`, `notInterestedComments`, `requestDelete`

**Payment:**
- `paid`, `paidDate`, `responsibleForPayment`

**Promo Code:**
- `promoCode` (FK), `promoCodeDiscount`, `promoCodeDiscountOffR`, `promoCodeValid`

**Recipient Information:**
- `recipientEmail`, `recipientFirstName`, `recipientLastName`, `recipientPhoneWhatsapp`, `recipientWhatsapp`

**School Information:**
- `schoolName` (FK), `schoolGrade`, `schoolSyllabus`, `schoolSyllabusOther`, `schoolType`

**Student Information:**
- `studentEmail`, `studentFirstName`, `studentLastName`, `studentGender`, `studentPhoneWhatsapp`

**Swapout:**
- `swapout`

**Tertiary Information:**
- `tertiaryCourseYearsListNums`, `tertiaryStudyGuideUrl`, `tertiaryTopicsList`

**Tutor Information:**
- `tutorFor`, `tutoringStartPeriod`, `tutoringType`, `tutorsAssignedList`, `tutorsHourlyRateList`, `tutorsNotifiedNum`

**User Information:**
- `userId`, `userType`

**Audit Fields:**
- `slug`, `creator`, `creationDate`, `modifiedDate`

**Relationships:**
- **Many-to-One** with `TertiaryName` (via `instituteName` → `tertiaryName`)
- **Many-to-One** with `SchoolName` (via `schoolName` → `schoolNames`)
- **Many-to-One** with `BursaryName` (via `bursaryName` → `bursaryName`)
- **Many-to-One** with `PromoCode` (via `promoCode` → `promoCode`)
- **One-to-Many** with `TutorSessionsOrder`
- **One-to-Many** with `TutorJobNotification`
- **One-to-Many** with `TutorStudentHour`
- **One-to-Many** with `StudentLesson`

---

### 7. TutorSessionsOrder (tutor_sessions_orders)

**Primary Key:** `uniqueId` (string)

**Attributes:**

**Company Fields:**
- `companyTotalPaymentEarning`, `companyRatePerHour`

**Course Fields:**
- `course`, `courseRequestId`, `fullAllocationCourse`

**Duration Fields:**
- `durationOfTutoring`, `durationPerLesson`

**Hours Fields:**
- `hours`, `hoursBookingAmount`, `hoursRemaining`

**Institute Fields:**
- `institute`, `learningType`

**Lessons:**
- `lessonsPerWeek`

**Payment Fields:**
- `paid`, `platformFee`, `refund`

**Promo Code Fields:**
- `promoCode` (FK), `promoCodeApplied`, `promoCodeDiscountAmount`, `promoCodeDiscountPercentage`

**Recipient:**
- `recipientEmail`

**Request Fields:**
- `requestId` (FK), `requestInvoiceNum`

**School Fields:**
- `schoolGrade`, `schoolSyllabus`, `schoolSyllabusOther`, `schoolType`

**Student Fields:**
- `studentEmail`, `studentName`, `studentRatePerHour`

**Swapout Fields:**
- `swapOut`, `swapOutFeedback`

**Total Amount Fields:**
- `totalAmount`, `totalAmountPromo`

**Tutor Fields:**
- `tutorApplicationId`, `tutorAvailability`, `tutorEarning`, `tutorEmail`, `tutorId`, `tutorRateDiscountAmount`, `tutorRatePerHour`, `tutorRatePerHourPromo`, `tutoringWith`

**User Fields:**
- `userId`

**Audit Fields:**
- `slug`, `creator`, `creationDate`, `modifiedDate`

**Relationships:**
- **Many-to-One** with `TutorRequest` (via `requestId` → `uniqueId`)
- **Many-to-One** with `PromoCode` (via `promoCode` → `promoCode`)
- **One-to-Many** with `TutorStudentHour`
- **One-to-Many** with `StudentLesson`

---

### 8. StudentLesson (student_lessons)

**Primary Key:** `uniqueId` (string)

**Attributes:**

**Admin Fields:**
- `adminLessonFeedback`, `adminLessonApproved`, `adminRejectedLessonReviewed`, `adminTutorOutcomeFeedback`

**Course Fields:**
- `courseName`

**Lesson Fields:**
- `lessonDate`, `lessonHours`, `lessonInstitute`, `lessonLearningType`, `lessonLocation`, `lessonLocationType`, `lessonTimeDescription`, `lessonVenueOther`, `lessonRejected`

**Order Fields:**
- `orderId` (FK)

**Payment Fields:**
- `paymentStatus`

**Request Fields:**
- `requestUniqueId` (FK)

**Student Fields:**
- `studentLessonFeedback`, `studentLessonRating`, `studentName`, `studentReviewDate`, `studentReviewed`, `userIdStudent`

**Swapout Fields:**
- `swapoutReview`

**Tutor Fields:**
- `tutorEarning`, `tutorFeedbackAboutStudent`, `tutorPaid`, `tutorRatingOfStudent`, `tutorUniqueId`, `tutorName`, `tutorRatePerHour`

**Audit Fields:**
- `slug`, `creator`, `creationDate`, `modifiedDate`

**Relationships:**
- **Many-to-One** with `TutorRequest` (via `requestUniqueId` → `uniqueId`)
- **Many-to-One** with `TutorSessionsOrder` (via `orderId` → `uniqueId`)

---

### 9. TutorStudentHour (tutor_student_hours)

**Primary Key:** `uniqueId` (string)

**Attributes:**
- `additionalHours` (int)
- `course`, `courseId` (strings)
- `hourlyRateR` (decimal, precision: 10, scale: 2)
- `invoiceNo` (string)
- `orderId` (FK, string)
- `paid` (boolean, default: false)
- `requestId` (FK, string)
- `spamNotInterested` (boolean, default: false)
- `studentName` (string)
- `totalAmountR` (decimal, precision: 10, scale: 2)
- `tutorEmail`, `tutorName` (strings)
- `userId` (string)
- `slug`, `creator` (strings)
- `creationDate`, `modifiedDate` (timestamps)

**Relationships:**
- **Many-to-One** with `TutorRequest` (via `requestId` → `uniqueId`)
- **Many-to-One** with `TutorSessionsOrder` (via `orderId` → `uniqueId`)

---

### 10. Invoice (invoices)

**Primary Key:** `uniqueId` (string)

**Attributes:**
- `invoiceNumber` (unique, string)
- `studentEmail`, `studentName` (strings)
- `bursaryStudentId` (FK, string)
- `courseId` (FK, string)
- `courseName` (string)
- `amount` (decimal, precision: 10, scale: 2)
- `dueDate`, `issueDate` (dates)
- `status` (enum: 'paid', 'pending', 'overdue', 'cancelled')
- `paymentMethod` (string)
- `paymentDate` (timestamp)
- `notes` (text)
- `bursaryName`, `createdBy` (strings)
- `slug`, `creator` (strings)
- `creationDate`, `modifiedDate` (timestamps)

**Relationships:**
- **Many-to-One** with `BursaryStudent` (via `bursaryStudentId` → `uniqueId`)
- **Many-to-One** with `Course` (via `courseId` → `uniqueId`)

---

### 11. StudentProgress (student_progress)

**Primary Key:** `uniqueId` (string)

**Attributes:**
- `studentEmail`, `studentName` (strings)
- `bursaryStudentId` (FK, string)
- `courseId` (FK, string)
- `courseName` (string)
- `overallProgress` (decimal, precision: 5, scale: 2, default: 0)
- `gpa` (decimal, precision: 3, scale: 2)
- `creditsCompleted`, `totalCredits` (int, default: 120)
- `attendancePercentage`, `assignmentsPercentage`, `examsPercentage`, `participationPercentage` (decimals)
- `status` (enum: 'active', 'inactive', 'completed', 'dropped')
- `enrollmentDate`, `completionDate` (dates)
- `bursaryName`, `university` (strings)
- `yearOfStudy` (int)
- `slug`, `creator` (strings)
- `creationDate`, `modifiedDate` (timestamps)

**Relationships:**
- **Many-to-One** with `BursaryStudent` (via `bursaryStudentId` → `uniqueId`)
- **Many-to-One** with `Course` (via `courseId` → `uniqueId`)

---

## Reference/Lookup Entities

### 12. PromoCode (promo_codes)

**Primary Key:** `uniqueId` (string)

**Attributes:**
- `promoCode` (unique, string)
- `discount` (decimal, precision: 5, scale: 2)
- `source` (string)
- `useNumber` (int)
- `voucherAmount` (decimal, precision: 10, scale: 2)
- `slug`, `creator` (strings)
- `creationDate`, `modifiedDate` (timestamps)

**Relationships:**
- **One-to-Many** with `TutorRequest`
- **One-to-Many** with `TutorSessionsOrder`

---

### 13. SchoolName (school_names)

**Primary Key:** `uniqueId` (string)

**Attributes:**
- `schoolNames` (unique, string)
- `schoolType` (string)
- `slug`, `creator` (strings)
- `creationDate`, `modifiedDate` (timestamps)

**Relationships:**
- **One-to-Many** with `TutorRequest` (via `schoolName` → `schoolNames`)

---

### 14. TertiaryName (tertiary_names)

**Primary Key:** `uniqueId` (string)

**Attributes:**
- `tertiaryName` (unique, string)
- `tertiaryCodes`, `tertiaryNamesCode` (strings)
- `slug`, `creator` (strings)
- `creationDate`, `modifiedDate` (timestamps)

**Relationships:**
- **One-to-Many** with `TutorRequest` (via `instituteName` → `tertiaryName`)

---

### 15. TertiaryProgramme (tertiary_programmes)

**Primary Key:** `uniqueId` (string)

**Attributes:**
- `tertiaryProgramme` (string)
- `slug`, `creator` (strings)
- `creationDate`, `modifiedDate` (timestamps)

**Relationships:** None

---

### 16. TertiarySpecialization (tertiary_specializations)

**Primary Key:** `uniqueId` (string)

**Attributes:**
- `tertiarySpecialization` (string)
- `slug`, `creator` (strings)
- `creationDate`, `modifiedDate` (timestamps)

**Relationships:** None

---

### 17. Bank (bank)

**Primary Key:** `uniqueId` (string)

**Attributes:**
- `bankName` (string)
- `branchCode` (string)
- `slug`, `creator` (strings)
- `creationDate`, `modifiedDate` (timestamps)

**Relationships:** None

---

### 18. TutorJobNotification (tutor_job_notifications)

**Primary Key:** `uniqueId` (string)

**Attributes:**
- `requestUniqueId` (FK, string)
- `matchScoreList` (text)
- `tutorUniqueIdList` (text)
- `source` (string)
- `slug`, `creator` (strings)
- `creationDate`, `modifiedDate` (timestamps)

**Relationships:**
- **Many-to-One** with `TutorRequest` (via `requestUniqueId` → `uniqueId`)

---

### 19. AuditLog (audit_logs)

**Primary Key:** `uniqueId` (string)

**Attributes:**
- `userId`, `userEmail`, `userRole` (strings)
- `action`, `entityType`, `entityId` (strings)
- `bursaryName`, `studentEmail` (strings)
- `description` (text)
- `oldValues`, `newValues` (jsonb)
- `ipAddress`, `userAgent`, `requestId` (strings)
- `status` (enum: 'success', 'error', 'warning')
- `errorMessage` (text)
- `executionTimeMs` (int)
- `module`, `operation` (strings)
- `metadata` (jsonb)
- `createdAt` (timestamp)

**Relationships:** None (standalone audit table)

---

## Relationship Summary

### One-to-Many Relationships

1. **BursaryName** → **BursaryStudent** (1:N)
   - Via: `BursaryName.bursaryName` = `BursaryStudent.bursary`

2. **BursaryName** → **TutorRequest** (1:N)
   - Via: `BursaryName.bursaryName` = `TutorRequest.bursaryName`

3. **BursaryName** → **UserProfile** (1:N)
   - Via: `BursaryName.bursaryName` = `UserProfile.bursaryName`

4. **BursaryStudent** → **Invoice** (1:N)
   - Via: `BursaryStudent.uniqueId` = `Invoice.bursaryStudentId`

5. **BursaryStudent** → **StudentProgress** (1:N)
   - Via: `BursaryStudent.uniqueId` = `StudentProgress.bursaryStudentId`

6. **Course** → **Lesson** (1:N)
   - Via: `Course.uniqueId` = `Lesson.courseId`

7. **Course** → **Invoice** (1:N)
   - Via: `Course.uniqueId` = `Invoice.courseId`

8. **Course** → **StudentProgress** (1:N)
   - Via: `Course.uniqueId` = `StudentProgress.courseId`

9. **TutorRequest** → **TutorSessionsOrder** (1:N)
   - Via: `TutorRequest.uniqueId` = `TutorSessionsOrder.requestId`

10. **TutorRequest** → **TutorJobNotification** (1:N)
    - Via: `TutorRequest.uniqueId` = `TutorJobNotification.requestUniqueId`

11. **TutorRequest** → **TutorStudentHour** (1:N)
    - Via: `TutorRequest.uniqueId` = `TutorStudentHour.requestId`

12. **TutorRequest** → **StudentLesson** (1:N)
    - Via: `TutorRequest.uniqueId` = `StudentLesson.requestUniqueId`

13. **TutorSessionsOrder** → **TutorStudentHour** (1:N)
    - Via: `TutorSessionsOrder.uniqueId` = `TutorStudentHour.orderId`

14. **TutorSessionsOrder** → **StudentLesson** (1:N)
    - Via: `TutorSessionsOrder.uniqueId` = `StudentLesson.orderId`

15. **PromoCode** → **TutorRequest** (1:N)
    - Via: `PromoCode.promoCode` = `TutorRequest.promoCode`

16. **PromoCode** → **TutorSessionsOrder** (1:N)
    - Via: `PromoCode.promoCode` = `TutorSessionsOrder.promoCode`

17. **TertiaryName** → **TutorRequest** (1:N)
    - Via: `TertiaryName.tertiaryName` = `TutorRequest.instituteName`

18. **SchoolName** → **TutorRequest** (1:N)
    - Via: `SchoolName.schoolNames` = `TutorRequest.schoolName`

---

## Common Audit Fields

All entities (except AuditLog) include the following audit/metadata fields:

- `creationDate` (timestamp) - Automatically set on creation
- `modifiedDate` (timestamp) - Automatically updated on modification
- `slug` (string) - URL-friendly identifier
- `creator` (string) - User who created the record

---

## Notes

1. **Primary Keys**: All entities use `uniqueId` as the primary key (string/UUID), except `UserProfile` which uses `email`.

2. **Foreign Key Relationships**: Relationships are defined using TypeORM decorators, with foreign keys stored as string fields that reference the primary key of the related entity.

3. **Denormalization**: Some entities store denormalized data (e.g., `courseName` in `Lesson`, `Invoice`, `StudentProgress`) for performance and query simplicity.

4. **Enums**: Several entities use enum types for status fields:
   - `Lesson.status`: 'published', 'draft', 'archived'
   - `Invoice.status`: 'paid', 'pending', 'overdue', 'cancelled'
   - `StudentProgress.status`: 'active', 'inactive', 'completed', 'dropped'
   - `AuditLog.status`: 'success', 'error', 'warning'

5. **JSONB Fields**: Some entities use JSONB for flexible data storage:
   - `AuditLog.oldValues`, `AuditLog.newValues`, `AuditLog.metadata`

6. **Text Fields**: Many entities use text fields for storing lists or long-form content (e.g., `tutorsAssignedList`, `requestCourses`).

---

## Database Schema Version

This ERD reflects the current database schema as of the latest migration. For migration history, see the `migrations/` directory.

---

*Last Updated: Generated from TypeORM entity definitions*

