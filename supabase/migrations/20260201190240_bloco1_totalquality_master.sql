-- Migration: Bloco 1 - Total Quality Master - Area Fit Infrastructure
-- Description: Implements data infrastructure for the first client (Area Fit)
-- and market intelligence management
-- 
-- Changes:
-- 1. Add columns to companies table: logo_url, market_intelligence, statistical_studies
-- 2. Update profiles table: extend role constraints, add status_homologacao
-- 3. Implement RLS policies for 'master' and 'proprietario' roles

-- ============================================================================
-- PART 1: MIGRATE COMPANIES TABLE
-- ============================================================================

-- Add logo_url column (text, nullable)
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add market_intelligence column (jsonb, default: {})
-- Expected internal fields: cnae_principal, setor_atuacao, geolocalizacao (lat/long),
-- densidade_demografica_local, indice_concorrencia
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS market_intelligence JSONB DEFAULT '{}'::jsonb;

-- Add statistical_studies column (jsonb, default: {})
-- Expected internal fields: churn_rate, margin_per_student, clv, cac, ebitda_projetado
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS statistical_studies JSONB DEFAULT '{}'::jsonb;

-- ============================================================================
-- PART 2: UPDATE PROFILES TABLE
-- ============================================================================

-- Drop existing check constraint on role column if exists
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add status_homologacao column (boolean, default: false)
-- Controls initial access after training
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status_homologacao BOOLEAN DEFAULT false;

-- Update role check constraint to allow Area Fit operational profiles:
-- 'master', 'proprietario', 'recepcionista', 'professor', 'manutencao', 'estacionamento'
-- Also keep existing roles: 'auditor', 'empresa', 'total_quality_iso'
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check 
  CHECK (role IN (
    'master',
    'proprietario', 
    'recepcionista', 
    'professor', 
    'manutencao', 
    'estacionamento',
    'auditor',
    'empresa',
    'total_quality_iso'
  ));

-- ============================================================================
-- PART 3: GOVERNANCE AND RLS POLICIES
-- ============================================================================

-- Drop existing policies that may conflict with new role-based policies
DROP POLICY IF EXISTS "master_full_access" ON public.companies;
DROP POLICY IF EXISTS "proprietario_own_company" ON public.companies;
DROP POLICY IF EXISTS "proprietario_update_company" ON public.companies;
DROP POLICY IF EXISTS "proprietario_delete_company" ON public.companies;

-- Policy for 'master' role: Full access (ALL) to companies table
-- Master has complete access to all companies for system management
CREATE POLICY "master_full_access" 
ON public.companies 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'master'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'master'
  )
);

-- Policy for 'proprietario' role: Full access only to their own company_id
-- SELECT policy for proprietario
DROP POLICY IF EXISTS "proprietario_view_company" ON public.companies;
CREATE POLICY "proprietario_view_company" 
ON public.companies 
FOR SELECT
USING (
  id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'proprietario'
  )
);

-- UPDATE policy for proprietario
CREATE POLICY "proprietario_update_company" 
ON public.companies 
FOR UPDATE
USING (
  id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'proprietario'
  )
)
WITH CHECK (
  id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'proprietario'
  )
);

-- DELETE policy for proprietario
CREATE POLICY "proprietario_delete_company" 
ON public.companies 
FOR DELETE
USING (
  id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'proprietario'
  )
);

-- INSERT policy for proprietario (allows creating records for their company)
DROP POLICY IF EXISTS "proprietario_insert_company" ON public.companies;
CREATE POLICY "proprietario_insert_company" 
ON public.companies 
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);
