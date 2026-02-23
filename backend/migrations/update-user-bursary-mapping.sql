-- Update user profiles to use unique_id mapping to bursaries
-- This script maps user unique_id to bursary unique_id based on the naming pattern

-- First, let's see the current mapping
SELECT 
    up.email,
    up.user_type,
    up.unique_id as user_unique_id,
    up.bursary_name,
    bn.unique_id as bursary_unique_id,
    bn.bursary_name as bursary_display_name
FROM user_profiles up
LEFT JOIN bursary_names bn ON up.bursary_name = bn.bursary_name
ORDER BY up.creation_date DESC;

-- Update user profiles based on unique_id pattern mapping
-- Map UP_TEST_002 -> BN_TEST_001 (Test Bursary)
UPDATE user_profiles 
SET bursary_name = 'Test Bursary'
WHERE unique_id = 'UP_TEST_002';

-- Map UP_SAEF_002 -> BN_SAEF_001 (South African Education Foundation)
UPDATE user_profiles 
SET bursary_name = 'South African Education Foundation'
WHERE unique_id = 'UP_SAEF_002';

-- Map UP_FUNZA_002 -> BN_FUNZA_001 (FUNZA)
UPDATE user_profiles 
SET bursary_name = 'FUNZA'
WHERE unique_id = 'UP_FUNZA_002';

-- Map UP_NSFAS_002 -> NSFAS (using the existing NSFAS entry)
UPDATE user_profiles 
SET bursary_name = 'NSFAS'
WHERE unique_id = 'UP_NSFAS_002';

-- Verify the updates
SELECT 
    up.email,
    up.user_type,
    up.unique_id as user_unique_id,
    up.bursary_name,
    bn.unique_id as bursary_unique_id,
    bn.bursary_name as bursary_display_name
FROM user_profiles up
LEFT JOIN bursary_names bn ON up.bursary_name = bn.bursary_name
WHERE up.user_type = 'bursary_admin'
ORDER BY up.creation_date DESC;









