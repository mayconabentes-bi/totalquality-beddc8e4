-- ========================================================
-- Database Cleanup Script for Development Environment
-- ========================================================
-- IMPORTANT: This script is for development use only!
-- Run this in the Supabase SQL Editor to clean all test data
-- ========================================================

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
