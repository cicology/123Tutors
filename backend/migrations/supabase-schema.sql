-- 123Tutors Database Schema for Supabase
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/dwhuhioxszupmxvgxhqb/sql

-- =============================================
-- 1. BANK TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS bank (
  unique_id VARCHAR(255) PRIMARY KEY,
  bank_name VARCHAR(255),
  branch_code VARCHAR(255),
  creation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modified_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  slug VARCHAR(255),
  creator VARCHAR(255)
);

-- =============================================
-- 2. BURSARY_NAMES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS bursary_names (
  unique_id VARCHAR(255) PRIMARY KEY,
  address TEXT,
  bursary_name VARCHAR(255) UNIQUE NOT NULL,
  creation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modified_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  slug VARCHAR(255),
  creator VARCHAR(255),
  logo TEXT,
  description TEXT,
  email VARCHAR(255),
  phone VARCHAR(255),
  website VARCHAR(255),
  total_students INTEGER DEFAULT 0,
  total_budget DECIMAL(15, 2),
  year_established INTEGER,
  programs_offered INTEGER DEFAULT 0,
  primary_color VARCHAR(255) DEFAULT '#FF0090',
  secondary_color VARCHAR(255) DEFAULT '#F8F9FA'
);

-- =============================================
-- 3. COURSES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS courses (
  unique_id VARCHAR(255) PRIMARY KEY,
  institute_name VARCHAR(255),
  module_code_name_search VARCHAR(255),
  module_description TEXT,
  module_year INTEGER,
  module_code VARCHAR(255),
  module_name VARCHAR(255),
  skill_category VARCHAR(255),
  skill_name VARCHAR(255),
  subject_name VARCHAR(255),
  creation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modified_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  slug VARCHAR(255),
  creator VARCHAR(255),
  module_level VARCHAR(255),
  module_credits INTEGER
);

-- =============================================
-- 4. SCHOOL_NAMES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS school_names (
  unique_id VARCHAR(255) PRIMARY KEY,
  school_type VARCHAR(255),
  school_names VARCHAR(255) UNIQUE NOT NULL,
  creation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modified_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  slug VARCHAR(255),
  creator VARCHAR(255)
);

-- =============================================
-- 5. TERTIARY_NAMES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS tertiary_names (
  unique_id VARCHAR(255) PRIMARY KEY,
  tertiary_name VARCHAR(255) UNIQUE NOT NULL,
  tertiary_codes VARCHAR(255),
  tertiary_names_code VARCHAR(255),
  creation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modified_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  slug VARCHAR(255),
  creator VARCHAR(255)
);

-- =============================================
-- 6. TERTIARY_PROGRAMMES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS tertiary_programmes (
  unique_id VARCHAR(255) PRIMARY KEY,
  tertiary_programme VARCHAR(255) NOT NULL,
  creation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modified_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  slug VARCHAR(255),
  creator VARCHAR(255)
);

-- =============================================
-- 7. TERTIARY_SPECIALIZATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS tertiary_specializations (
  unique_id VARCHAR(255) PRIMARY KEY,
  tertiary_specialization VARCHAR(255) NOT NULL,
  creation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modified_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  slug VARCHAR(255),
  creator VARCHAR(255)
);

-- =============================================
-- 8. USER_PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  email VARCHAR(255) PRIMARY KEY,
  user_type VARCHAR(255) DEFAULT 'user',
  bursary_name VARCHAR(255),
  creation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modified_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  slug VARCHAR(255),
  creator VARCHAR(255),
  unique_id VARCHAR(255) UNIQUE NOT NULL,
  profile_image_url VARCHAR(255),
  logo_url VARCHAR(255)
);

-- =============================================
-- 9. TUTOR_REQUESTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS tutor_requests (
  unique_id VARCHAR(255) PRIMARY KEY,

  -- Address fields
  address_city VARCHAR(255),
  address_country VARCHAR(255),
  address_full TEXT,
  address_province VARCHAR(255),
  address_suburb_town VARCHAR(255),

  -- Course allocation fields
  all_courses_allocated TEXT,
  courses_allocated_number INTEGER,
  request_courses TEXT,
  request_courses_unallocated TEXT,
  request_available_courses_request_id_list TEXT,

  -- Bursary fields
  bursary_email VARCHAR(255),
  bursary_name VARCHAR(255),
  bursary_phone VARCHAR(255),
  bursary_client_request_auto_approved BOOLEAN DEFAULT FALSE,
  bursary_debt DECIMAL(10, 2),

  -- Contact fields
  contact_comments TEXT,
  contact_sales VARCHAR(255),
  contacted_sales_boolean BOOLEAN DEFAULT FALSE,
  contacted_type VARCHAR(255),

  -- Financial fields
  credited DECIMAL(10, 2),
  eft_paid DECIMAL(10, 2),
  total_amount DECIMAL(10, 2),
  platform_fee DECIMAL(10, 2),
  refund_amount DECIMAL(10, 2),
  refund_reason TEXT,
  refunded BOOLEAN DEFAULT FALSE,

  -- Tutoring requirements
  extra_tutoring_requirements TEXT,
  hourly_rate_list_text TEXT,
  hours_list_text TEXT,

  -- Installment fields
  installment_payment BOOLEAN DEFAULT FALSE,
  installment_r DECIMAL(10, 2),
  installment_1_paid BOOLEAN DEFAULT FALSE,
  installment_2_paid BOOLEAN DEFAULT FALSE,
  installment_3_paid BOOLEAN DEFAULT FALSE,
  installment_paid_up BOOLEAN DEFAULT FALSE,

  -- Institute fields
  institute_code VARCHAR(255),
  institute_name VARCHAR(255),
  institute_programme VARCHAR(255),
  institute_specialization VARCHAR(255),
  institute_student_year_of_study INTEGER,

  -- Invoice fields
  invoice_number VARCHAR(255),

  -- Language fields
  language_1_main VARCHAR(255),
  language_2_other VARCHAR(255),
  learning_type VARCHAR(255),

  -- Marketing fields
  marketing_meme_page_influencer VARCHAR(255),
  marketing_feedback TEXT,
  marketing_feedback_other TEXT,

  -- Request status fields
  new_system_request BOOLEAN DEFAULT FALSE,
  not_interested BOOLEAN DEFAULT FALSE,
  not_interested_comments TEXT,
  request_delete BOOLEAN DEFAULT FALSE,

  -- Payment fields
  paid BOOLEAN DEFAULT FALSE,
  paid_date TIMESTAMP WITH TIME ZONE,
  responsible_for_payment VARCHAR(255),

  -- Promo code fields
  promo_code VARCHAR(255),
  promo_code_discount DECIMAL(5, 2),
  promo_code_discount_off_r DECIMAL(10, 2),
  promo_code_valid BOOLEAN DEFAULT FALSE,

  -- Recipient fields
  recipient_email VARCHAR(255),
  recipient_first_name VARCHAR(255),
  recipient_last_name VARCHAR(255),
  recipient_phone_whatsapp VARCHAR(255),
  recipient_whatsapp VARCHAR(255),

  -- School fields
  school_grade VARCHAR(255),
  school_name VARCHAR(255),
  school_syllabus VARCHAR(255),
  school_syllabus_other VARCHAR(255),
  school_type VARCHAR(255),
  street_address TEXT,

  -- Student fields
  student_email VARCHAR(255) NOT NULL,
  student_first_name VARCHAR(255) NOT NULL,
  student_gender VARCHAR(255),
  student_last_name VARCHAR(255) NOT NULL,
  student_phone_whatsapp VARCHAR(255),

  -- Swapout fields
  swapout BOOLEAN DEFAULT FALSE,

  -- Tertiary fields
  tertiary_course_years_list_nums TEXT,
  tertiary_study_guide_url TEXT,
  tertiary_topics_list TEXT,

  -- Tutor fields
  tutor_for VARCHAR(255),
  tutoring_start_period VARCHAR(255),
  tutoring_type VARCHAR(255),
  tutors_assigned_list TEXT,
  tutors_hourly_rate_list TEXT,
  tutors_notified_num INTEGER,

  -- User fields
  user_id VARCHAR(255),
  user_type VARCHAR(255),

  -- Audit fields
  creation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modified_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  slug VARCHAR(255),
  creator VARCHAR(255)
);

-- =============================================
-- INDEXES FOR BETTER QUERY PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_unique_id ON user_profiles(unique_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON user_profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_bursary_name ON user_profiles(bursary_name);

CREATE INDEX IF NOT EXISTS idx_tutor_requests_student_email ON tutor_requests(student_email);
CREATE INDEX IF NOT EXISTS idx_tutor_requests_bursary_name ON tutor_requests(bursary_name);
CREATE INDEX IF NOT EXISTS idx_tutor_requests_institute_name ON tutor_requests(institute_name);
CREATE INDEX IF NOT EXISTS idx_tutor_requests_school_name ON tutor_requests(school_name);
CREATE INDEX IF NOT EXISTS idx_tutor_requests_paid ON tutor_requests(paid);
CREATE INDEX IF NOT EXISTS idx_tutor_requests_creation_date ON tutor_requests(creation_date);

CREATE INDEX IF NOT EXISTS idx_courses_institute_name ON courses(institute_name);
CREATE INDEX IF NOT EXISTS idx_courses_module_code ON courses(module_code);

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
SELECT 'Schema created successfully! Tables: bank, bursary_names, courses, school_names, tertiary_names, tertiary_programmes, tertiary_specializations, user_profiles, tutor_requests' AS status;
