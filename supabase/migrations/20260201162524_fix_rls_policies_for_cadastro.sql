-- Migration: Fix RLS policies to resolve 401 errors during signup
-- Description: This migration removes old policies that were causing 401/RLS errors
-- and implements definitive policies for initial company and profile registration

-- 1. Remove políticas antigas que estão causando o erro 401/RLS
DROP POLICY IF EXISTS "Users can insert their own company" ON public.companies;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.companies;
DROP POLICY IF EXISTS "Allow_Insert_Company_Registration" ON public.companies;

-- 2. Cria a política SNIPER para permitir o cadastro (Resolução Definitiva)
-- Esta política permite que o usuário insira os dados da empresa se o ID do usuário bater com o ID autenticado
CREATE POLICY "cadastro_inicial_empresas" 
ON public.companies 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Garante que o usuário possa ler os próprios dados após o cadastro
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;
CREATE POLICY "visualizacao_propria_empresa" 
ON public.companies 
FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Repete o processo para a tabela de perfis para garantir o passo 3 do cadastro
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "cadastro_inicial_perfis" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
