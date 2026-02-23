-- STEP 3: Insert bursary names and user profiles
-- Run this AFTER the column and constraints have been added

-- Ensure the required bursary names exist in bursary_names table
INSERT INTO bursary_names (unique_id, bursary_name, slug, creator, creation_date, modified_date) VALUES
('BN_NSFAS_001', 'NSFAS', 'nsfas', 'system', NOW(), NOW()),
('BN_FUNZA_001', 'FUNZA', 'funza', 'system', NOW(), NOW()),
('BN_SAEF_001', 'South African Education Foundation', 'saef', 'system', NOW(), NOW()),
('BN_TEST_001', 'Test Bursary', 'test-bursary', 'system', NOW(), NOW())
ON CONFLICT (bursary_name) DO NOTHING;

-- Insert the user profiles for bursary administrators
INSERT INTO user_profiles (email, user_type, bursary_name, unique_id, slug, creator, creation_date, modified_date) VALUES
('u17079463tuks@gmail.com', 'bursary_admin', 'NSFAS', 'UP_NSFAS_002', 'nsfas-admin-2', 'system', NOW(), NOW()),
('aaron@123tutors.co.za', 'bursary_admin', 'FUNZA', 'UP_FUNZA_002', 'funza-admin-2', 'system', NOW(), NOW()),
('afonso@123tutors.co.za', 'bursary_admin', 'South African Education Foundation', 'UP_SAEF_002', 'saef-admin-2', 'system', NOW(), NOW()),
('afonsomogoaneng@gmail.com', 'bursary_admin', 'Test Bursary', 'UP_TEST_002', 'test-admin-2', 'system', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
    user_type = EXCLUDED.user_type,
    bursary_name = EXCLUDED.bursary_name,
    unique_id = EXCLUDED.unique_id,
    slug = EXCLUDED.slug,
    creator = EXCLUDED.creator,
    modified_date = NOW();









