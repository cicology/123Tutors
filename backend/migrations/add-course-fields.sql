-- Add missing course fields
-- This migration adds module_level and module_credits columns to the courses table

-- Add module_level column
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS module_level VARCHAR(50);

-- Add module_credits column  
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS module_credits INTEGER;

-- Update existing courses with default values
UPDATE courses 
SET module_level = 'Intermediate' 
WHERE module_level IS NULL;

UPDATE courses 
SET module_credits = 12 
WHERE module_credits IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN courses.module_level IS 'Course difficulty level (Beginner, Intermediate, Advanced)';
COMMENT ON COLUMN courses.module_credits IS 'Number of credits for this course';


