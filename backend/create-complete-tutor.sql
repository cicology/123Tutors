-- Create a complete tutor with all necessary data for dashboard to work properly
-- Email: complete.tutor@example.com
-- Password: tutor123
-- This script will delete existing tutor if it exists and recreate with all data

DO $$
DECLARE
    tutor_id_var UUID;
    app_id_var UUID;
    course1_id UUID := gen_random_uuid();
    course2_id UUID := gen_random_uuid();
    course3_id UUID := gen_random_uuid();
    student1_id UUID := gen_random_uuid();
    student2_id UUID := gen_random_uuid();
    student3_id UUID := gen_random_uuid();
    request1_id UUID := gen_random_uuid();
    request2_id UUID := gen_random_uuid();
    request3_id UUID := gen_random_uuid();
    lesson1_id UUID := gen_random_uuid();
    lesson2_id UUID := gen_random_uuid();
    lesson3_id UUID := gen_random_uuid();
    lesson4_id UUID := gen_random_uuid();
    review1_id UUID := gen_random_uuid();
    review2_id UUID := gen_random_uuid();
    review3_id UUID := gen_random_uuid();
    payment1_id UUID := gen_random_uuid();
    payment2_id UUID := gen_random_uuid();
    existing_tutor_id UUID;
BEGIN
    -- Check if tutor already exists and delete related data
    SELECT id INTO existing_tutor_id FROM tutors WHERE email = 'complete.tutor@example.com';
    
    IF existing_tutor_id IS NOT NULL THEN
        -- Delete related data
        DELETE FROM payments WHERE "tutorId" = existing_tutor_id;
        DELETE FROM reviews WHERE "tutorId" = existing_tutor_id;
        DELETE FROM lessons WHERE "tutorId" = existing_tutor_id;
        DELETE FROM course_requests WHERE "tutorId" = existing_tutor_id;
        DELETE FROM courses WHERE "tutorId" = existing_tutor_id;
        DELETE FROM tutor_applications WHERE "tutorId" = existing_tutor_id;
        DELETE FROM tutors WHERE id = existing_tutor_id;
        RAISE NOTICE 'Deleted existing tutor and related data';
    END IF;

    -- Step 1: Create the tutor
    tutor_id_var := gen_random_uuid();
    
    INSERT INTO tutors (
        id,
        email,
        password,
        "firstName",
        "lastName",
        phone,
        location,
        subjects,
        qualifications,
        experience,
        status,
        rating,
        "totalSessions",
        "totalStudents",
        "firstLessonDate",
        "isAmbassador",
        "tutorReferralsCount",
        "createdAt",
        "updatedAt"
    ) VALUES (
        tutor_id_var,
        'complete.tutor@example.com',
        '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', -- password: tutor123
        'Sarah',
        'Johnson',
        '+27123456789',
        'Cape Town',
        'Mathematics, Physics, Chemistry',
        'BSc Mathematics, MSc Physics, PGCE',
        '10+ years of teaching experience. Specialized in high school and university level mathematics and physics. Passionate about helping students achieve their academic goals.',
        'approved',
        4.75,
        50,
        8,
        NOW() - INTERVAL '6 months',
        false,
        0,
        NOW() - INTERVAL '1 year',
        NOW()
    );

    -- Step 2: Create tutor application
    app_id_var := gen_random_uuid();
    
    INSERT INTO tutor_applications (
        id,
        "tutorId",
        status,
        "createdAt",
        "updatedAt"
    ) VALUES (
        app_id_var,
        tutor_id_var,
        'approved',
        NOW() - INTERVAL '1 year',
        NOW() - INTERVAL '11 months'
    );

    -- Step 3: Create courses
    INSERT INTO courses (id, "tutorId", name, description, subject, level, "isActive", "createdAt", "updatedAt")
    VALUES
        (course1_id, tutor_id_var, 'Advanced Mathematics', 'Comprehensive mathematics course covering algebra, calculus, and statistics', 'Mathematics', 'Grade 12', true, NOW() - INTERVAL '10 months', NOW()),
        (course2_id, tutor_id_var, 'Physics Fundamentals', 'Introduction to physics concepts and problem-solving techniques', 'Physics', 'Grade 11', true, NOW() - INTERVAL '9 months', NOW()),
        (course3_id, tutor_id_var, 'Chemistry Basics', 'Foundation course in chemistry covering atomic structure and reactions', 'Chemistry', 'Grade 10', true, NOW() - INTERVAL '8 months', NOW());

    -- Step 4: Create students (with unique emails)
    INSERT INTO students (id, email, password, "firstName", "lastName", phone, location, level, subject, "createdAt", "updatedAt")
    VALUES
        (student1_id, 'complete.student1@example.com', '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'John', 'Doe', '+27111111111', 'Cape Town', 'Grade 12', 'Mathematics', NOW() - INTERVAL '6 months', NOW())
    ON CONFLICT (email) DO UPDATE SET id = student1_id;
    
    INSERT INTO students (id, email, password, "firstName", "lastName", phone, location, level, subject, "createdAt", "updatedAt")
    VALUES
        (student2_id, 'complete.student2@example.com', '$2a$10$rOzJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'Jane', 'Smith', '+27222222222', 'Cape Town', 'Grade 11', 'Physics', NOW() - INTERVAL '5 months', NOW())
    ON CONFLICT (email) DO UPDATE SET id = student2_id;
    
    INSERT INTO students (id, email, password, "firstName", "lastName", phone, location, level, subject, "createdAt", "updatedAt")
    VALUES
        (student3_id, 'complete.student3@example.com', '$2a$10$rOzJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'Mike', 'Brown', '+27333333333', 'Cape Town', 'Grade 10', 'Chemistry', NOW() - INTERVAL '4 months', NOW())
    ON CONFLICT (email) DO UPDATE SET id = student3_id;

    -- Get actual student IDs (in case they already existed)
    SELECT id INTO student1_id FROM students WHERE email = 'complete.student1@example.com';
    SELECT id INTO student2_id FROM students WHERE email = 'complete.student2@example.com';
    SELECT id INTO student3_id FROM students WHERE email = 'complete.student3@example.com';

    -- Step 5: Create accepted course requests
    INSERT INTO course_requests (id, "studentId", "tutorId", "courseId", status, "preferredSchedule", message, "lessonCount", "lessonDuration", "totalPrice", notes, "createdAt", "updatedAt")
    VALUES
        (request1_id, student1_id, tutor_id_var, course1_id, 'accepted', '{"preferredSlots":[{"day":"Monday","start":"15:00","end":"16:30"},{"day":"Wednesday","start":"15:00","end":"16:30"}]}', 'Need help with calculus', 12, 90, 3600.00, 'Student needs intensive preparation', NOW() - INTERVAL '5 months', NOW() - INTERVAL '4 months'),
        (request2_id, student2_id, tutor_id_var, course2_id, 'accepted', '{"preferredSlots":[{"day":"Tuesday","start":"16:00","end":"17:00"},{"day":"Thursday","start":"16:00","end":"17:00"}]}', 'Struggling with physics concepts', 8, 60, 2400.00, 'Focus on mechanics', NOW() - INTERVAL '4 months', NOW() - INTERVAL '3 months'),
        (request3_id, student3_id, tutor_id_var, course3_id, 'accepted', '{"preferredSlots":[{"day":"Friday","start":"14:00","end":"15:00"}]}', 'Chemistry basics needed', 4, 60, 1200.00, 'Beginner level', NOW() - INTERVAL '3 months', NOW() - INTERVAL '2 months');

    -- Step 6: Create lessons (mix of scheduled and completed)
    INSERT INTO lessons (id, "tutorId", "studentId", "courseId", subject, "scheduledAt", duration, type, status, "requestId", "hourlyRate", "totalAmount", notes, "completedAt", "createdAt", "updatedAt")
    VALUES
        (lesson1_id, tutor_id_var, student1_id, course1_id, 'Calculus - Derivatives', NOW() + INTERVAL '2 days', 90, 'online', 'scheduled', request1_id, 200.00, 300.00, 'Focus on chain rule', NULL, NOW() - INTERVAL '4 months', NOW()),
        (lesson2_id, tutor_id_var, student1_id, course1_id, 'Calculus - Integration', NOW() - INTERVAL '1 week', 90, 'online', 'completed', request1_id, 200.00, 300.00, 'Good progress', NOW() - INTERVAL '1 week', NOW() - INTERVAL '4 months', NOW()),
        (lesson3_id, tutor_id_var, student2_id, course2_id, 'Mechanics - Forces', NOW() + INTERVAL '5 days', 60, 'online', 'scheduled', request2_id, 200.00, 200.00, 'Review Newton laws', NULL, NOW() - INTERVAL '3 months', NOW()),
        (lesson4_id, tutor_id_var, student3_id, course3_id, 'Atomic Structure', NOW() - INTERVAL '3 days', 60, 'online', 'completed', request3_id, 200.00, 200.00, 'Well understood', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 months', NOW());

    -- Step 7: Create reviews
    INSERT INTO reviews (id, "tutorId", "studentId", rating, comment, "createdAt", "updatedAt")
    VALUES
        (review1_id, tutor_id_var, student1_id, 5, 'Excellent tutor! Very patient and explains concepts clearly.', NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months'),
        (review2_id, tutor_id_var, student2_id, 5, 'Great teaching style. Helped me understand physics much better.', NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months'),
        (review3_id, tutor_id_var, student3_id, 4, 'Good tutor, very knowledgeable. Would recommend.', NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 month');

    -- Step 8: Create payments
    INSERT INTO payments (id, "tutorId", "studentId", "lessonId", "requestId", amount, "tutorAmount", "commissionAmount", "commissionRate", status, "sessionDuration", "paidAt", "createdAt", "updatedAt")
    VALUES
        (payment1_id, tutor_id_var, student1_id, lesson2_id, request1_id, 300.00, 270.00, 30.00, 10.00, 'completed', 90, NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week'),
        (payment2_id, tutor_id_var, student3_id, lesson4_id, request3_id, 200.00, 180.00, 20.00, 10.00, 'completed', 60, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days');

    RAISE NOTICE 'Tutor created successfully with ID: %', tutor_id_var;
    RAISE NOTICE 'Email: complete.tutor@example.com';
    RAISE NOTICE 'Password: tutor123';
END $$;
