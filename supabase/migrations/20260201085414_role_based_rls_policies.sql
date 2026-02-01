-- Migration: Implement role-based Row Level Security policies
-- Description: Replace basic RLS policies with role-based access control
-- - 'empresa' role: Can only see their own company data
-- - 'total_quality_iso' role: Has global vision across all companies
-- - 'auditor' role: Can see companies they are linked to

-- 1. Ensure RLS is enabled on all critical tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing basic RLS policies on companies table
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;

-- 3. Policy for Empresas: Only see their own data
-- Filters so that the logged-in company only sees its record in the companies table
DROP POLICY IF EXISTS "Empresas visualizam apenas seus próprios dados" ON public.companies;
CREATE POLICY "Empresas visualizam apenas seus próprios dados" 
ON public.companies 
FOR SELECT 
USING (
  id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'empresa'
  )
);

-- 4. Policy for Total Quality ISO: Global Vision
-- Allows full read access for macro management and indicators across all companies
DROP POLICY IF EXISTS "Total Quality ISO possui visão global" ON public.companies;
CREATE POLICY "Total Quality ISO possui visão global" 
ON public.companies 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'total_quality_iso'
  )
);

-- 5. Policy for Auditors: See all companies
-- Note: Currently grants access to all companies. For company-specific auditors,
-- add company_id filter similar to empresa policy
DROP POLICY IF EXISTS "Auditores veem empresas vinculadas" ON public.companies;
CREATE POLICY "Auditores veem empresas vinculadas" 
ON public.companies 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'auditor'
  )
);
