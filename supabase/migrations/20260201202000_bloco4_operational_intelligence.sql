-- Migration: Bloco 4 - Operational Intelligence (Secretary & Trainers)
-- Description: Implements data infrastructure for fitness management
-- 
-- Changes:
-- 1. Create modalities table for fitness classes/activities
-- 2. Create students table for student/member management
-- 3. Create student_flow table for visit tracking and sales funnel
-- 4. Create performance_rankings table for trainer evaluations
-- 5. Implement RLS policies for role-based access control

-- ============================================================================
-- PART 1: CREATE MODALITIES TABLE
-- ============================================================================

-- Create modalities table for fitness classes (Musculação, Jiu-Jitsu, Yoga, etc.)
CREATE TABLE IF NOT EXISTS public.modalities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on modalities table
ALTER TABLE public.modalities ENABLE ROW LEVEL SECURITY;

-- RLS Policy: 'master' role has full access (ALL)
CREATE POLICY "master_full_access_modalities" 
ON public.modalities 
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

-- RLS Policy: 'proprietario' and 'secretaria' can access their company's data
CREATE POLICY "proprietario_secretaria_view_modalities" 
ON public.modalities 
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('proprietario', 'secretaria')
  )
);

CREATE POLICY "proprietario_secretaria_insert_modalities" 
ON public.modalities 
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('proprietario', 'secretaria')
  )
);

CREATE POLICY "proprietario_secretaria_update_modalities" 
ON public.modalities 
FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('proprietario', 'secretaria')
  )
)
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('proprietario', 'secretaria')
  )
);

CREATE POLICY "proprietario_secretaria_delete_modalities" 
ON public.modalities 
FOR DELETE
USING (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('proprietario', 'secretaria')
  )
);

-- RLS Policy: 'treinador' can view modalities
CREATE POLICY "treinador_view_modalities" 
ON public.modalities 
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'treinador'
  )
);

-- ============================================================================
-- PART 2: CREATE STUDENTS TABLE
-- ============================================================================

-- Create students table for student/member management
CREATE TABLE IF NOT EXISTS public.students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cpf TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  status TEXT NOT NULL CHECK (status IN ('Ativo', 'Inativo', 'Cancelado')) DEFAULT 'Ativo',
  cancellation_reason TEXT,
  dependents JSONB DEFAULT '[]'::jsonb,
  geo_economic_profile TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on students table
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- RLS Policy: 'master' role has full access (ALL)
CREATE POLICY "master_full_access_students" 
ON public.students 
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

-- RLS Policy: 'proprietario', 'secretaria', 'treinador' can access their company's data
CREATE POLICY "proprietario_secretaria_treinador_view_students" 
ON public.students 
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('proprietario', 'secretaria', 'treinador')
  )
);

CREATE POLICY "proprietario_secretaria_insert_students" 
ON public.students 
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('proprietario', 'secretaria')
  )
);

CREATE POLICY "proprietario_secretaria_update_students" 
ON public.students 
FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('proprietario', 'secretaria')
  )
)
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('proprietario', 'secretaria')
  )
);

CREATE POLICY "proprietario_secretaria_delete_students" 
ON public.students 
FOR DELETE
USING (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('proprietario', 'secretaria')
  )
);

-- ============================================================================
-- PART 3: CREATE STUDENT_FLOW TABLE (Sales Funnel)
-- ============================================================================

-- Create student_flow table for visit tracking and sales funnel
CREATE TABLE IF NOT EXISTS public.student_flow (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  visitor_name TEXT NOT NULL,
  visit_type TEXT NOT NULL CHECK (visit_type IN ('Visita sem Aula', 'Visita com Aula Agendada')),
  visit_date TIMESTAMPTZ DEFAULT NOW(),
  converted_to_student BOOLEAN DEFAULT FALSE,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on student_flow table
ALTER TABLE public.student_flow ENABLE ROW LEVEL SECURITY;

-- RLS Policy: 'master' role has full access (ALL)
CREATE POLICY "master_full_access_student_flow" 
ON public.student_flow 
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

-- RLS Policy: 'proprietario' and 'secretaria' can access their company's data
CREATE POLICY "proprietario_secretaria_view_student_flow" 
ON public.student_flow 
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('proprietario', 'secretaria')
  )
);

CREATE POLICY "proprietario_secretaria_insert_student_flow" 
ON public.student_flow 
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('proprietario', 'secretaria')
  )
);

CREATE POLICY "proprietario_secretaria_update_student_flow" 
ON public.student_flow 
FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('proprietario', 'secretaria')
  )
)
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('proprietario', 'secretaria')
  )
);

CREATE POLICY "proprietario_secretaria_delete_student_flow" 
ON public.student_flow 
FOR DELETE
USING (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('proprietario', 'secretaria')
  )
);

-- ============================================================================
-- PART 4: CREATE PERFORMANCE_RANKINGS TABLE
-- ============================================================================

-- Create performance_rankings table for trainer evaluations
CREATE TABLE IF NOT EXISTS public.performance_rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  evaluation_date DATE DEFAULT CURRENT_DATE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  technique_score INTEGER CHECK (technique_score >= 0 AND technique_score <= 100),
  load_score INTEGER CHECK (load_score >= 0 AND load_score <= 100),
  attendance_score INTEGER CHECK (attendance_score >= 0 AND attendance_score <= 100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on performance_rankings table
ALTER TABLE public.performance_rankings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: 'master' role has full access (ALL)
CREATE POLICY "master_full_access_performance_rankings" 
ON public.performance_rankings 
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

-- RLS Policy: 'proprietario' can access their company's data
CREATE POLICY "proprietario_view_performance_rankings" 
ON public.performance_rankings 
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'proprietario'
  )
);

-- RLS Policy: 'treinador' can view all rankings and insert/update their own evaluations
CREATE POLICY "treinador_view_performance_rankings" 
ON public.performance_rankings 
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'treinador'
  )
);

CREATE POLICY "treinador_insert_performance_rankings" 
ON public.performance_rankings 
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'treinador'
  ) AND
  trainer_id IN (
    SELECT id FROM public.profiles 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "treinador_update_performance_rankings" 
ON public.performance_rankings 
FOR UPDATE
USING (
  trainer_id IN (
    SELECT id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'treinador'
  )
)
WITH CHECK (
  trainer_id IN (
    SELECT id FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'treinador'
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_company ON public.students(company_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_student_flow_company ON public.student_flow(company_id);
CREATE INDEX IF NOT EXISTS idx_student_flow_date ON public.student_flow(visit_date);
CREATE INDEX IF NOT EXISTS idx_performance_rankings_company ON public.performance_rankings(company_id);
CREATE INDEX IF NOT EXISTS idx_performance_rankings_student ON public.performance_rankings(student_id);
CREATE INDEX IF NOT EXISTS idx_performance_rankings_date ON public.performance_rankings(evaluation_date);
