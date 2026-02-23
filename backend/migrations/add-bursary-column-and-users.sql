-- Step 1: Add the missing bursary_name column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS bursary_name VARCHAR(255) NULL;

-- Step 2: Add foreign key constraint to link user_profiles.bursary_name to bursary_names.bursary_name
-- Note: This will fail if the column doesn't exist, so we ensure it exists first
DO $$ 
BEGIN
    -- Check if the foreign key constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_profiles_bursary_name'
        AND table_name = 'user_profiles'
    ) THEN
        ALTER TABLE user_profiles 
        ADD CONSTRAINT fk_user_profiles_bursary_name 
        FOREIGN KEY (bursary_name) REFERENCES bursary_names(bursary_name) 
        ON DELETE SET NULL ON UPDATE CASCADE;
        RAISE NOTICE 'Added foreign key constraint fk_user_profiles_bursary_name';
    ELSE
        RAISE NOTICE 'Foreign key constraint fk_user_profiles_bursary_name already exists';
    END IF;
END $$;

-- Step 3: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_bursary_name ON user_profiles(bursary_name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type_bursary ON user_profiles(user_type, bursary_name);

-- Step 4: Ensure the required bursary names exist in bursary_names table
INSERT INTO bursary_names (unique_id, bursary_name, slug, creator, creation_date, modified_date) VALUES
('BN_NSFAS_001', 'NSFAS', 'nsfas', 'system', NOW(), NOW()),
('BN_FUNZA_001', 'FUNZA', 'funza', 'system', NOW(), NOW()),
('BN_SAEF_001', 'South African Education Foundation', 'saef', 'system', NOW(), NOW()),
('BN_TEST_001', 'Test Bursary', 'test-bursary', 'system', NOW(), NOW())
ON CONFLICT (bursary_name) DO NOTHING;

-- Step 5: Insert the user profiles for bursary administrators
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

-- Step 6: Verify the results and relationships
SELECT 
    up.email,
    up.user_type,
    up.bursary_name,
    up.unique_id,
    bn.description as bursary_description,
    bn.email as bursary_email,
    bn.website as bursary_website,
    up.creation_date
FROM user_profiles up
LEFT JOIN bursary_names bn ON up.bursary_name = bn.bursary_name
WHERE up.email IN (
    'u17079463tuks@gmail.com',
    'aaron@123tutors.co.za', 
    'afonso@123tutors.co.za',
    'afonsomogoaneng@gmail.com'
)
ORDER BY up.email;
