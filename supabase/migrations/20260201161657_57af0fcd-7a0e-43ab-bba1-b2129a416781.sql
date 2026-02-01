-- Garante que o RLS permita a inserção inicial da empresa
DROP POLICY IF EXISTS "Users can insert their own company" ON public.companies;

CREATE POLICY "Users can insert their own company" 
ON public.companies 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);