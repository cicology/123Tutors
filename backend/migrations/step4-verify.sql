-- STEP 4: Verify the results
-- Run this to check that everything was created correctly

-- Check the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Check the foreign key constraint
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'user_profiles' 
AND constraint_type = 'FOREIGN KEY';

-- Check the inserted user profiles
SELECT 
    email,
    user_type,
    bursary_name,
    unique_id,
    creation_date
FROM user_profiles 
WHERE email IN (
    'u17079463tuks@gmail.com',
    'aaron@123tutors.co.za', 
    'afonso@123tutors.co.za',
    'afonsomogoaneng@gmail.com'
)
ORDER BY email;

-- Check the bursary names
SELECT unique_id, bursary_name, slug 
FROM bursary_names 
WHERE bursary_name IN ('NSFAS', 'FUNZA', 'South African Education Foundation', 'Test Bursary')
ORDER BY bursary_name;









