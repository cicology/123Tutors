-- STEP 2: Add indexes and foreign key constraint
-- Run this AFTER the bursary_name column has been added

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_bursary_name ON user_profiles(bursary_name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type_bursary ON user_profiles(user_type, bursary_name);

-- Add foreign key constraint
ALTER TABLE user_profiles 
ADD CONSTRAINT fk_user_profiles_bursary_name 
FOREIGN KEY (bursary_name) REFERENCES bursary_names(bursary_name) 
ON DELETE SET NULL ON UPDATE CASCADE;









