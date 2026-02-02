-- Add governance and contract fields to companies table
-- Migration: Add client_code, client_since, contract_end, and notes columns

-- Add client_code column (unique identifier like TQ-101, TQ-102, etc.)
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS client_code TEXT UNIQUE;

-- Add client_since column (registration date)
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS client_since DATE;

-- Add contract_end column (contract end date)
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS contract_end DATE;

-- Add notes column (strategic observations)
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create a function to auto-generate client codes
CREATE OR REPLACE FUNCTION generate_client_code()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  new_code TEXT;
BEGIN
  -- Find the highest existing number in client_code
  SELECT COALESCE(MAX(CAST(SUBSTRING(client_code FROM 'TQ-(\d+)') AS INTEGER)), 100) + 1
  INTO next_number
  FROM public.companies
  WHERE client_code ~ '^TQ-\d+$';
  
  -- Generate the new code
  new_code := 'TQ-' || next_number;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to auto-populate client_code if not provided
CREATE OR REPLACE FUNCTION set_client_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.client_code IS NULL THEN
    NEW.client_code := generate_client_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists (for safe re-runs)
DROP TRIGGER IF EXISTS trigger_set_client_code ON public.companies;

-- Create the trigger
CREATE TRIGGER trigger_set_client_code
BEFORE INSERT ON public.companies
FOR EACH ROW
EXECUTE FUNCTION set_client_code();

-- Comment for documentation
COMMENT ON COLUMN public.companies.client_code IS 'Unique client identifier in format TQ-XXX (auto-generated)';
COMMENT ON COLUMN public.companies.client_since IS 'Date when the client was registered';
COMMENT ON COLUMN public.companies.contract_end IS 'Contract end date';
COMMENT ON COLUMN public.companies.notes IS 'Strategic notes and observations about the client';
