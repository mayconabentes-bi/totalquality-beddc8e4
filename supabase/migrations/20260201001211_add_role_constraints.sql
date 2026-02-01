-- Migration: Add role constraints to profiles table
-- Description: Ensures data integrity by constraining role values to valid options
-- and setting 'empresa' as the default role

-- Step 1: Update the default value for role column from 'admin' to 'empresa'
ALTER TABLE public.profiles 
  ALTER COLUMN role SET DEFAULT 'empresa';

-- Step 2: Add CHECK CONSTRAINT to allow only specific role values
-- This prevents invalid role values from being inserted into the database
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('auditor', 'empresa', 'total_quality_iso'));

-- Note: If there are existing rows with invalid role values (e.g., 'admin'),
-- they will need to be updated before this constraint can be applied.
-- Uncomment and run the following if needed:
-- UPDATE public.profiles SET role = 'empresa' WHERE role NOT IN ('auditor', 'empresa', 'total_quality_iso');
