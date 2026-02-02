-- Migration: Add access control and module delegation fields
-- Description: Add active_modules (JSONB) and user_permissions (JSONB) to profiles table
-- 
-- active_modules format:
-- {
--   "axioma_mercado": true,
--   "axioma_estatistica": true,
--   "gestao_riscos": true,
--   "nps": true,
--   "manutencao": true
-- }
--
-- user_permissions format:
-- {
--   "pode_editar": true,
--   "pode_deletar": true,
--   "pode_exportar": true
-- }

-- Add active_modules column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS active_modules JSONB DEFAULT '{
  "axioma_mercado": false,
  "axioma_estatistica": false,
  "gestao_riscos": false,
  "nps": false,
  "manutencao": false
}'::jsonb;

-- Add user_permissions column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS user_permissions JSONB DEFAULT '{
  "pode_editar": false,
  "pode_deletar": false,
  "pode_exportar": false
}'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.active_modules IS 'JSON object tracking which modules are active for this user';
COMMENT ON COLUMN public.profiles.user_permissions IS 'JSON object tracking user permissions (edit, delete, export)';

-- Set all master and proprietario users to have all modules active by default
UPDATE public.profiles
SET active_modules = '{
  "axioma_mercado": true,
  "axioma_estatistica": true,
  "gestao_riscos": true,
  "nps": true,
  "manutencao": true
}'::jsonb,
user_permissions = '{
  "pode_editar": true,
  "pode_deletar": true,
  "pode_exportar": true
}'::jsonb
WHERE role IN ('master', 'proprietario');
