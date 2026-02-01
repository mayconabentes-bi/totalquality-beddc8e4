-- ========================================================
-- Database Cleanup Script for Development Environment
-- ========================================================
-- IMPORTANT: This script is for development use only!
-- Run this in the Supabase SQL Editor to clean all test data
-- ========================================================

-- SAFETY CHECK: Only run in development/test databases
-- This prevents accidental execution in production
DO $$
DECLARE
  db_name TEXT;
BEGIN
  SELECT current_database() INTO db_name;
  
  -- Check if database name contains production indicators
  IF db_name NOT LIKE '%dev%' AND db_name NOT LIKE '%test%' AND db_name NOT LIKE '%local%' AND db_name NOT LIKE '%staging%' THEN
    RAISE EXCEPTION '
    ============================================
    SAFETY CHECK FAILED!
    ============================================
    This cleanup script can only run in development/test databases.
    Current database: %
    
    If this is truly a development database, rename it to include 
    "dev", "test", "local", or "staging" in the name.
    ============================================
    ', db_name;
  END IF;
  
  RAISE NOTICE 'Safety check passed. Database: %', db_name;
END $$;

-- Step 1: Clean profiles first (due to foreign key dependency on companies)
DELETE FROM public.profiles;

-- Step 2: Clean companies table
DELETE FROM public.companies;

-- Step 3: Clean authentication users
-- Note: This removes all users from the authentication system
DELETE FROM auth.users;

-- ========================================================
-- Verification queries (optional - uncomment to verify)
-- ========================================================
-- SELECT COUNT(*) as profiles_count FROM public.profiles;
-- SELECT COUNT(*) as companies_count FROM public.companies;
-- SELECT COUNT(*) as users_count FROM auth.users;
