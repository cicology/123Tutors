-- Migration to change total_budget from varchar to decimal
-- This migration updates the total_budget column in bursary_names table to use decimal type

-- Step 1: Convert existing string values to numeric (remove currency symbols and commas)
-- Handle values like "R1,500,000" or "1500000" or "1500000.00"
UPDATE bursary_names 
SET total_budget = CASE 
  WHEN total_budget IS NULL OR total_budget = '' THEN NULL
  ELSE CAST(REGEXP_REPLACE(total_budget, '[^0-9.]', '', 'g') AS DECIMAL(15, 2))
END
WHERE total_budget IS NOT NULL;

-- Step 2: Alter the column type from varchar to decimal
-- Note: This will fail if there are any non-numeric values that couldn't be converted
-- In that case, you'll need to manually clean the data first
ALTER TABLE bursary_names 
ALTER COLUMN total_budget TYPE DECIMAL(15, 2) 
USING CASE 
  WHEN total_budget IS NULL OR total_budget = '' THEN NULL
  ELSE CAST(REGEXP_REPLACE(total_budget, '[^0-9.]', '', 'g') AS DECIMAL(15, 2))
END;

-- Add comment for documentation
COMMENT ON COLUMN bursary_names.total_budget IS 'Annual budget amount in decimal format (e.g., 1500000.00)';




