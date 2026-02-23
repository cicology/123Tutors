# Backend Foreign Key Constraint Fix

## Issue
The error "there is no unique constraint matching given keys for referenced table 'bursary_students'" was occurring because some entities were trying to create foreign key relationships using non-unique columns.

## Root Cause
Two entities had incorrect foreign key relationships:
1. `StudentProgress` entity was trying to reference `studentEmail` in `BursaryStudent`
2. `Invoice` entity was trying to reference `studentEmail` in `BursaryStudent`

The `studentEmail` field in `BursaryStudent` is not unique, so it cannot be used as a foreign key reference.

## Fix Applied

### 1. StudentProgress Entity (`src/student-progress/student-progress.entity.ts`)
**Before:**
```typescript
@ManyToOne(() => BursaryStudent, (bursaryStudent) => bursaryStudent.studentEmail)
@JoinColumn({ name: 'student_email', referencedColumnName: 'studentEmail' })
student: BursaryStudent;
```

**After:**
```typescript
@Column({ name: 'bursary_student_id', nullable: true })
bursaryStudentId: string;

@ManyToOne(() => BursaryStudent)
@JoinColumn({ name: 'bursary_student_id', referencedColumnName: 'uniqueId' })
student: BursaryStudent;
```

### 2. Invoice Entity (`src/invoices/invoices.entity.ts`)
**Before:**
```typescript
@ManyToOne(() => BursaryStudent, (bursaryStudent) => bursaryStudent.studentEmail)
@JoinColumn({ name: 'student_email', referencedColumnName: 'studentEmail' })
student: BursaryStudent;
```

**After:**
```typescript
@Column({ name: 'bursary_student_id', nullable: true })
bursaryStudentId: string;

@ManyToOne(() => BursaryStudent)
@JoinColumn({ name: 'bursary_student_id', referencedColumnName: 'uniqueId' })
student: BursaryStudent;
```

## Changes Made
1. Added `bursaryStudentId` column to both entities to store the foreign key
2. Updated the `@JoinColumn` decorator to reference the primary key (`uniqueId`) instead of `studentEmail`
3. Kept the `studentEmail` column for direct access to email data
4. Made the foreign key nullable to allow for flexibility

## Verification
- All other foreign key relationships in the codebase are correctly referencing unique columns or primary keys
- No linting errors were introduced
- The relationships now properly reference the `uniqueId` primary key of `BursaryStudent`

## Database Migration Required
When applying these changes to a production database, you'll need to:
1. Add the new `bursary_student_id` columns to both tables
2. Populate the new columns with the appropriate `uniqueId` values from `bursary_students` table
3. Drop the old foreign key constraints
4. Add the new foreign key constraints

The backend should now start without the foreign key constraint error.

