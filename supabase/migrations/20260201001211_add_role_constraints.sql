-- Migration: Add role constraints to profiles table
-- Description: Ensures data integrity by constraining role values to valid options
-- and setting 'empresa' as the default role

-- Step 1: Update any existing rows with invalid or NULL role values to 'empresa'
-- This ensures the constraints can be added successfully
-- Expected impact: Updates rows with role values like 'admin' or NULL
UPDATE public.profiles 
SET role = 'empresa' 
WHERE role IS NULL OR role NOT IN ('auditor', 'empresa', 'total_quality_iso');

-- Step 2: Set the default value for role column to 'empresa'
ALTER TABLE public.profiles 
  ALTER COLUMN role SET DEFAULT 'empresa';

-- Step 3: Add NOT NULL constraint to ensure role is always set
ALTER TABLE public.profiles
  ALTER COLUMN role SET NOT NULL;

-- Step 4: Add CHECK CONSTRAINT to allow only specific role values
-- This prevents invalid role values from being inserted into the database
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('auditor', 'empresa', 'total_quality_iso'));
