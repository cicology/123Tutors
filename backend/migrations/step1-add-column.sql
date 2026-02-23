-- STEP 1: Add the bursary_name column to user_profiles table
-- Run this command first in your database interface

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS bursary_name VARCHAR(255) NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'bursary_name';









