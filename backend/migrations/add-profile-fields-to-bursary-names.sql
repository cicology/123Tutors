-- Migration: Add profile fields to bursary_names table
-- Date: 2024-09-13
-- Description: Extends bursary_names table with organization profile fields

-- Add new columns for organization profile
ALTER TABLE bursary_names 
ADD COLUMN IF NOT EXISTS logo TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(255),
ADD COLUMN IF NOT EXISTS website VARCHAR(255),
ADD COLUMN IF NOT EXISTS total_students INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_budget VARCHAR(255),
ADD COLUMN IF NOT EXISTS year_established INTEGER,
ADD COLUMN IF NOT EXISTS programs_offered INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS primary_color VARCHAR(255) DEFAULT '#FF0090',
ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(255) DEFAULT '#F8F9FA';

-- Add comments for documentation
COMMENT ON COLUMN bursary_names.logo IS 'Organization logo URL or base64 encoded image';
COMMENT ON COLUMN bursary_names.description IS 'Organization description and mission';
COMMENT ON COLUMN bursary_names.email IS 'Organization contact email';
COMMENT ON COLUMN bursary_names.phone IS 'Organization contact phone number';
COMMENT ON COLUMN bursary_names.website IS 'Organization website URL';
COMMENT ON COLUMN bursary_names.total_students IS 'Total number of students enrolled';
COMMENT ON COLUMN bursary_names.total_budget IS 'Total annual budget amount';
COMMENT ON COLUMN bursary_names.year_established IS 'Year organization was established';
COMMENT ON COLUMN bursary_names.programs_offered IS 'Number of programs offered';
COMMENT ON COLUMN bursary_names.primary_color IS 'Primary brand color hex code';
COMMENT ON COLUMN bursary_names.secondary_color IS 'Secondary brand color hex code';

-- Create indexes for better performance on commonly queried fields
CREATE INDEX IF NOT EXISTS idx_bursary_names_email ON bursary_names(email);
CREATE INDEX IF NOT EXISTS idx_bursary_names_year_established ON bursary_names(year_established);
CREATE INDEX IF NOT EXISTS idx_bursary_names_total_students ON bursary_names(total_students);


















