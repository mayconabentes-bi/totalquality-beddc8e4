-- Migration: Bloco 3 - Specialized Modules (Risk Management, Asset Maintenance, NPS)
-- Description: Implements data infrastructure for specialized quality management modules
-- 
-- Changes:
-- 1. Create risks table for risk management
-- 2. Create maintenance_assets table for asset maintenance tracking
-- 3. Create nps_feedback table for Net Promoter Score (Voice of Student)
-- 4. Implement RLS policies for role-based access control

-- ============================================================================
-- PART 1: CREATE RISKS TABLE
-- ============================================================================

-- Create risks table for risk management
CREATE TABLE IF NOT EXISTS public.risks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Operacional', 'Financeiro', 'Mercado')),
  probability INTEGER NOT NULL CHECK (probability >= 1 AND probability <= 5),
  impact INTEGER NOT NULL CHECK (impact >= 1 AND impact <= 5),
  mitigation_plan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on risks table
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: 'master' role has full access (ALL)
CREATE POLICY "master_full_access_risks" 
ON public.risks 
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

-- RLS Policy: 'proprietario' role can access only their company's data
CREATE POLICY "proprietario_view_risks" 
ON public.risks 
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'proprietario'
  )
);

CREATE POLICY "proprietario_insert_risks" 
ON public.risks 
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'proprietario'
  )
);

CREATE POLICY "proprietario_update_risks" 
ON public.risks 
FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'proprietario'
  )
)
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'proprietario'
  )
);

CREATE POLICY "proprietario_delete_risks" 
ON public.risks 
FOR DELETE
USING (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'proprietario'
  )
);

-- ============================================================================
-- PART 2: CREATE MAINTENANCE_ASSETS TABLE
-- ============================================================================

-- Create maintenance_assets table for asset maintenance tracking
CREATE TABLE IF NOT EXISTS public.maintenance_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  last_maintenance DATE,
  next_maintenance DATE,
  status TEXT NOT NULL CHECK (status IN ('Ok', 'Alerta', 'Crítico')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on maintenance_assets table
ALTER TABLE public.maintenance_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policy: 'master' role has full access (ALL)
CREATE POLICY "master_full_access_maintenance_assets" 
ON public.maintenance_assets 
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

-- RLS Policy: 'proprietario' role can access only their company's data
CREATE POLICY "proprietario_view_maintenance_assets" 
ON public.maintenance_assets 
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'proprietario'
  )
);

CREATE POLICY "proprietario_insert_maintenance_assets" 
ON public.maintenance_assets 
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'proprietario'
  )
);

CREATE POLICY "proprietario_update_maintenance_assets" 
ON public.maintenance_assets 
FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'proprietario'
  )
)
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'proprietario'
  )
);

CREATE POLICY "proprietario_delete_maintenance_assets" 
ON public.maintenance_assets 
FOR DELETE
USING (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'proprietario'
  )
);

-- RLS Policy: 'manutencao' role can access maintenance assets from their company
CREATE POLICY "manutencao_view_maintenance_assets" 
ON public.maintenance_assets 
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'manutencao'
  )
);

CREATE POLICY "manutencao_insert_maintenance_assets" 
ON public.maintenance_assets 
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'manutencao'
  )
);

CREATE POLICY "manutencao_update_maintenance_assets" 
ON public.maintenance_assets 
FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'manutencao'
  )
)
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'manutencao'
  )
);

-- ============================================================================
-- PART 3: CREATE NPS_FEEDBACK TABLE
-- ============================================================================

-- Create nps_feedback table for Net Promoter Score feedback
CREATE TABLE IF NOT EXISTS public.nps_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  comment TEXT,
  student_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on nps_feedback table
ALTER TABLE public.nps_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policy: 'master' role has full access (ALL)
CREATE POLICY "master_full_access_nps_feedback" 
ON public.nps_feedback 
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

-- RLS Policy: 'proprietario' role can access only their company's data
CREATE POLICY "proprietario_view_nps_feedback" 
ON public.nps_feedback 
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'proprietario'
  )
);

CREATE POLICY "proprietario_insert_nps_feedback" 
ON public.nps_feedback 
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'proprietario'
  )
);

CREATE POLICY "proprietario_update_nps_feedback" 
ON public.nps_feedback 
FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'proprietario'
  )
)
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'proprietario'
  )
);

CREATE POLICY "proprietario_delete_nps_feedback" 
ON public.nps_feedback 
FOR DELETE
USING (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'proprietario'
  )
);

-- RLS Policy: 'recepcionista' role can access NPS feedback from their company
CREATE POLICY "recepcionista_view_nps_feedback" 
ON public.nps_feedback 
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'recepcionista'
  )
);

CREATE POLICY "recepcionista_insert_nps_feedback" 
ON public.nps_feedback 
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'recepcionista'
  )
);
