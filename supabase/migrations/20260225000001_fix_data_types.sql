-- Fix data type mismatches for Bubble migration

-- courses: module_year contains text like "PostGrad", not just integers
ALTER TABLE courses ALTER COLUMN module_year TYPE VARCHAR(255);

-- tutor_requests: institute_student_year_of_study contains text like "Honours", "Masters"
ALTER TABLE tutor_requests ALTER COLUMN institute_student_year_of_study TYPE VARCHAR(255);

-- tutor_requests: some numeric fields have "true" values, convert to text where needed
-- Actually these should remain numeric but we need to clean the data, so let's make them nullable text for now
ALTER TABLE tutor_requests ALTER COLUMN courses_allocated_number TYPE VARCHAR(255);
ALTER TABLE tutor_requests ALTER COLUMN tutors_notified_num TYPE VARCHAR(255);

-- Increase VARCHAR lengths for fields with longer values
ALTER TABLE user_profiles ALTER COLUMN profile_image_url TYPE TEXT;
ALTER TABLE user_profiles ALTER COLUMN logo_url TYPE TEXT;
ALTER TABLE user_profiles ALTER COLUMN slug TYPE TEXT;
ALTER TABLE user_profiles ALTER COLUMN creator TYPE TEXT;

-- courses fields
ALTER TABLE courses ALTER COLUMN module_code_name_search TYPE TEXT;
ALTER TABLE courses ALTER COLUMN institute_name TYPE TEXT;

SELECT 'Schema fixes applied successfully!' AS status;
