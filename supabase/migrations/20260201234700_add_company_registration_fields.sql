-- Migration: Add Company Registration Fields from Receita Federal
-- Description: Adds fields for Brazilian Federal Revenue data to companies table
-- 
-- Changes:
-- 1. Add razao_social (Legal Name)
-- 2. Add nome_fantasia (Trade Name)
-- 3. Add data_abertura (Opening Date)
-- 4. Add full_address (JSONB for complete address)
-- 5. Add email field

-- Add razao_social column (legal name from Receita Federal)
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS razao_social TEXT;

-- Add nome_fantasia column (trade name/fantasy name)
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS nome_fantasia TEXT;

-- Add data_abertura column (company opening date)
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS data_abertura DATE;

-- Add full_address column (JSONB for complete address structure)
-- Expected internal fields: cep, logradouro, numero, complemento, bairro
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS full_address JSONB DEFAULT '{}'::jsonb;

-- Add email column for company contact
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Add logo_url column if not exists (for company branding)
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add comment to document the purpose of full_address
COMMENT ON COLUMN public.companies.full_address IS 'Complete address structure with fields: cep, logradouro, numero, complemento, bairro';

-- Add comment to document the purpose of statistical_studies  
COMMENT ON COLUMN public.companies.statistical_studies IS 'Statistical profitability metrics including capital_social, churn_rate, margin_per_student, clv, cac, ebitda_projetado';
