-- Ensure CNPJ column exists in companies table
-- This migration is idempotent and safe to run multiple times
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS cnpj TEXT;
