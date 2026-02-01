-- Migration: Create Parking Logs Table
-- Description: Implements parking management system for fitness center
-- 
-- Changes:
-- 1. Create parking_logs table for vehicle entry/exit tracking
-- 2. Implement RLS policies for role-based access control

-- ============================================================================
-- PART 1: CREATE PARKING_LOGS TABLE
-- ============================================================================

-- Create parking_logs table for vehicle tracking
CREATE TABLE IF NOT EXISTS public.parking_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  license_plate TEXT NOT NULL,
  entry_time TIMESTAMPTZ DEFAULT NOW(),
  exit_time TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('Entrada', 'Saída')) DEFAULT 'Entrada',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on parking_logs table
ALTER TABLE public.parking_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: 'master' role has full access (ALL)
CREATE POLICY "master_full_access_parking_logs" 
ON public.parking_logs 
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

-- RLS Policy: 'proprietario' and 'estacionamento' can access their company's data
CREATE POLICY "proprietario_estacionamento_view_parking_logs" 
ON public.parking_logs 
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('proprietario', 'estacionamento')
  )
);

CREATE POLICY "proprietario_estacionamento_insert_parking_logs" 
ON public.parking_logs 
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('proprietario', 'estacionamento')
  )
);

CREATE POLICY "proprietario_estacionamento_update_parking_logs" 
ON public.parking_logs 
FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('proprietario', 'estacionamento')
  )
)
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('proprietario', 'estacionamento')
  )
);

CREATE POLICY "proprietario_estacionamento_delete_parking_logs" 
ON public.parking_logs 
FOR DELETE
USING (
  company_id IN (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('proprietario', 'estacionamento')
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parking_logs_company ON public.parking_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_parking_logs_student ON public.parking_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_parking_logs_status ON public.parking_logs(status);
CREATE INDEX IF NOT EXISTS idx_parking_logs_entry_time ON public.parking_logs(entry_time);
CREATE INDEX IF NOT EXISTS idx_parking_logs_license_plate ON public.parking_logs(license_plate);

-- Comments on table
COMMENT ON TABLE public.parking_logs IS 'Vehicle parking management for fitness center';
COMMENT ON COLUMN public.parking_logs.status IS 'Entrada = Vehicle currently in parking lot, Saída = Vehicle has exited';
