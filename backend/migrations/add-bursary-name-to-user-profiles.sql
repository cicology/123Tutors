-- Migration: Add bursary_name column to user_profiles table
-- This migration adds a bursary_name field to link users to specific bursaries

-- Add bursary_name column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN bursary_name VARCHAR(255) NULL;

-- Add index for better query performance
CREATE INDEX idx_user_profiles_bursary_name ON user_profiles(bursary_name);

-- Add index for bursary admin queries
CREATE INDEX idx_user_profiles_user_type_bursary ON user_profiles(user_type, bursary_name);

-- Add comment to document the column
COMMENT ON COLUMN user_profiles.bursary_name IS 'Bursary name that the user is associated with. Required for bursary_admin users.';

-- Example: Create some sample bursary admin users
-- Note: Replace with actual email addresses and unique IDs
INSERT INTO user_profiles (email, user_type, bursary_name, unique_id, slug, creator) VALUES
('admin@nsfas.org.za', 'bursary_admin', 'NSFAS', 'UP_NSFAS_001', 'nsfas-admin', 'system'),
('admin@funza.org.za', 'bursary_admin', 'FUNZA', 'UP_FUNZA_001', 'funza-admin', 'system'),
('admin@saef.org.za', 'bursary_admin', 'South African Education Foundation', 'UP_SAEF_001', 'saef-admin', 'system'),
('test@test.com', 'bursary_admin', 'Test Bursary', 'UP_TEST_001', 'test-admin', 'system')
ON CONFLICT (email) DO NOTHING;

