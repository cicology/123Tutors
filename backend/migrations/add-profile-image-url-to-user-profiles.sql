-- Migration: Add profile_image_url column to user_profiles table
-- This migration adds a profile_image_url field to store user profile pictures

-- Add profile_image_url column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500) NULL;

-- Add comment to document the column
COMMENT ON COLUMN user_profiles.profile_image_url IS 'URL to the user profile image stored in Supabase Storage';

-- Verify the column was added
SELECT column_name, data_type, character_maximum_length, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'profile_image_url';


