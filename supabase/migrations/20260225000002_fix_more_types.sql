-- Fix remaining type issues for tutor_requests
-- Some DECIMAL columns have boolean values in the source data

-- Convert potentially problematic numeric columns to TEXT to handle mixed data
ALTER TABLE tutor_requests ALTER COLUMN credited TYPE TEXT;
ALTER TABLE tutor_requests ALTER COLUMN eft_paid TYPE TEXT;
ALTER TABLE tutor_requests ALTER COLUMN total_amount TYPE TEXT;
ALTER TABLE tutor_requests ALTER COLUMN platform_fee TYPE TEXT;
ALTER TABLE tutor_requests ALTER COLUMN refund_amount TYPE TEXT;
ALTER TABLE tutor_requests ALTER COLUMN bursary_debt TYPE TEXT;
ALTER TABLE tutor_requests ALTER COLUMN installment_r TYPE TEXT;
ALTER TABLE tutor_requests ALTER COLUMN promo_code_discount TYPE TEXT;
ALTER TABLE tutor_requests ALTER COLUMN promo_code_discount_off_r TYPE TEXT;

SELECT 'Additional type fixes applied!' AS status;
