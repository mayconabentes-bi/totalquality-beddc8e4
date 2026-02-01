-- Migration: Add Financial and Geodemographic Fields to Students Table
-- Description: Implements fields for revenue quality analysis and market density mapping
-- 
-- Changes:
-- 1. Add demographic fields (neighborhood, age, gender, marital_status, profession)
-- 2. Add financial fields (current_plan, current_payment_method, current_payment_status)
-- 3. Rename dependents to strategic_data for consistency
-- 4. Add indexes for analytics queries

-- ============================================================================
-- PART 1: ADD DEMOGRAPHIC FIELDS
-- ============================================================================

-- Add neighborhood field (critical for heatmap/geodemographic analysis)
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS neighborhood TEXT;

-- Add age field
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS age INTEGER CHECK (age >= 0 AND age <= 150);

-- Add gender field
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('Masculino', 'Feminino', 'Outro', 'Prefiro não informar'));

-- Add marital_status field
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS marital_status TEXT CHECK (marital_status IN ('Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável', 'Outro'));

-- Add profession field
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS profession TEXT;

-- Rename dependents to strategic_data (keeps backward compatibility as JSONB)
-- Note: We keep dependents as is since it's already JSONB and can store the enhanced data structure
-- The application layer will use it as strategic_data

-- ============================================================================
-- PART 2: ADD FINANCIAL ENGINEERING FIELDS
-- ============================================================================

-- Add current_plan field (subscription plan type)
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS current_plan TEXT CHECK (current_plan IN ('Mensal', 'Bimestral', 'Trimestral', 'Semestral', 'Anual'));

-- Add current_payment_method field
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS current_payment_method TEXT CHECK (current_payment_method IN ('Pix', 'Cartão de Crédito', 'Débito', 'Boleto', 'Recorrência'));

-- Add current_payment_status field (critical for revenue quality analysis)
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS current_payment_status TEXT CHECK (current_payment_status IN ('Adimplente', 'Inadimplente')) DEFAULT 'Adimplente';

-- ============================================================================
-- PART 3: CREATE INDEXES FOR ANALYTICS
-- ============================================================================

-- Index for neighborhood (geodemographic analysis)
CREATE INDEX IF NOT EXISTS idx_students_neighborhood ON public.students(neighborhood);

-- Index for payment status (revenue quality analysis)
CREATE INDEX IF NOT EXISTS idx_students_payment_status ON public.students(current_payment_status);

-- Index for plan type (revenue quality analysis)
CREATE INDEX IF NOT EXISTS idx_students_plan ON public.students(current_plan);

-- Composite index for status + payment status (dashboard queries)
CREATE INDEX IF NOT EXISTS idx_students_status_payment ON public.students(status, current_payment_status);

-- Comment on table
COMMENT ON COLUMN public.students.neighborhood IS 'Bairro do aluno - Critical for geodemographic heatmap';
COMMENT ON COLUMN public.students.current_payment_status IS 'Status de pagamento - Critical for revenue quality analysis';
COMMENT ON COLUMN public.students.dependents IS 'Strategic data in JSONB format - stores dependents names and ages';
