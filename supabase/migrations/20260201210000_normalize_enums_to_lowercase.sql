-- Migration: Normalize ENUM Values to Lowercase
-- Description: Updates CHECK constraints to use lowercase values for consistency
-- and to prevent case-sensitivity issues in queries
--
-- Changes:
-- 1. Update current_plan constraint to accept lowercase values
-- 2. Update current_payment_method constraint to accept lowercase values  
-- 3. Update current_payment_status constraint to accept lowercase values
-- 4. Update gender constraint to accept lowercase values
-- 5. Update marital_status constraint to accept lowercase values
-- 6. Update status constraint to accept lowercase values (for students)

-- ============================================================================
-- PART 1: DROP EXISTING CONSTRAINTS
-- ============================================================================

-- Drop existing CHECK constraints on students table
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_current_plan_check;
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_current_payment_method_check;
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_current_payment_status_check;
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_gender_check;
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_marital_status_check;
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_status_check;

-- ============================================================================
-- PART 2: ADD NEW LOWERCASE CONSTRAINTS
-- ============================================================================

-- Add current_plan constraint with lowercase values
ALTER TABLE public.students 
ADD CONSTRAINT students_current_plan_check 
CHECK (current_plan IN ('mensal', 'bimestral', 'trimestral', 'semestral', 'anual'));

-- Add current_payment_method constraint with lowercase values
ALTER TABLE public.students 
ADD CONSTRAINT students_current_payment_method_check 
CHECK (current_payment_method IN ('pix', 'cartao_credito', 'debito', 'boleto', 'recorrencia'));

-- Add current_payment_status constraint with lowercase values
ALTER TABLE public.students 
ADD CONSTRAINT students_current_payment_status_check 
CHECK (current_payment_status IN ('adimplente', 'inadimplente'));

-- Add gender constraint with lowercase values
ALTER TABLE public.students 
ADD CONSTRAINT students_gender_check 
CHECK (gender IN ('masculino', 'feminino', 'outro', 'nao_informar'));

-- Add marital_status constraint with lowercase values
ALTER TABLE public.students 
ADD CONSTRAINT students_marital_status_check 
CHECK (marital_status IN ('solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel', 'outro'));

-- Add status constraint with lowercase values (maintaining backward compatibility)
ALTER TABLE public.students 
ADD CONSTRAINT students_status_check 
CHECK (status IN ('ativo', 'inativo', 'cancelado'));

-- ============================================================================
-- PART 3: UPDATE EXISTING DATA TO LOWERCASE
-- ============================================================================

-- Update current_plan values
UPDATE public.students SET current_plan = LOWER(current_plan) WHERE current_plan IS NOT NULL;

-- Update current_payment_method values (replace spaces and special chars)
UPDATE public.students 
SET current_payment_method = CASE
  WHEN current_payment_method = 'Pix' THEN 'pix'
  WHEN current_payment_method = 'Cartão de Crédito' THEN 'cartao_credito'
  WHEN current_payment_method = 'Débito' THEN 'debito'
  WHEN current_payment_method = 'Boleto' THEN 'boleto'
  WHEN current_payment_method = 'Recorrência' THEN 'recorrencia'
  ELSE LOWER(current_payment_method)
END
WHERE current_payment_method IS NOT NULL;

-- Update current_payment_status values
UPDATE public.students SET current_payment_status = LOWER(current_payment_status) WHERE current_payment_status IS NOT NULL;

-- Update gender values
UPDATE public.students 
SET gender = CASE
  WHEN gender = 'Masculino' THEN 'masculino'
  WHEN gender = 'Feminino' THEN 'feminino'
  WHEN gender = 'Outro' THEN 'outro'
  WHEN gender = 'Prefiro não informar' THEN 'nao_informar'
  ELSE LOWER(gender)
END
WHERE gender IS NOT NULL;

-- Update marital_status values
UPDATE public.students 
SET marital_status = CASE
  WHEN marital_status = 'Solteiro(a)' THEN 'solteiro'
  WHEN marital_status = 'Casado(a)' THEN 'casado'
  WHEN marital_status = 'Divorciado(a)' THEN 'divorciado'
  WHEN marital_status = 'Viúvo(a)' THEN 'viuvo'
  WHEN marital_status = 'União Estável' THEN 'uniao_estavel'
  WHEN marital_status = 'Outro' THEN 'outro'
  ELSE LOWER(marital_status)
END
WHERE marital_status IS NOT NULL;

-- Update status values
UPDATE public.students 
SET status = CASE
  WHEN status = 'Ativo' THEN 'ativo'
  WHEN status = 'Inativo' THEN 'inativo'
  WHEN status = 'Cancelado' THEN 'cancelado'
  ELSE LOWER(status)
END
WHERE status IS NOT NULL;

-- ============================================================================
-- PART 4: UPDATE DEFAULT VALUES
-- ============================================================================

-- Update default value for current_payment_status
ALTER TABLE public.students ALTER COLUMN current_payment_status SET DEFAULT 'adimplente';

-- Add comments
COMMENT ON CONSTRAINT students_current_plan_check ON public.students 
IS 'Allows lowercase plan types: mensal, bimestral, trimestral, semestral, anual';

COMMENT ON CONSTRAINT students_current_payment_status_check ON public.students 
IS 'Allows lowercase payment status: adimplente, inadimplente';
