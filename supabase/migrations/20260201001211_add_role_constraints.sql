-- Migration: Add role constraints to profiles table
-- Description: Ensures data integrity by constraining role values to valid options
-- and setting 'empresa' as the default role

-- Step 1: Update any existing rows with invalid role values to 'empresa'
-- This ensures the CHECK constraint can be added successfully
UPDATE public.profiles 
SET role = 'empresa' 
WHERE role NOT IN ('auditor', 'empresa', 'total_quality_iso');

-- Step 2: Set the default value for role column to 'empresa'
ALTER TABLE public.profiles 
  ALTER COLUMN role SET DEFAULT 'empresa';

-- Step 3: Add CHECK CONSTRAINT to allow only specific role values
-- This prevents invalid role values from being inserted into the database
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('auditor', 'empresa', 'total_quality_iso'));
