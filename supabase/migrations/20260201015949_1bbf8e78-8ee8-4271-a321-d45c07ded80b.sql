-- Add DELETE policy for companies table
CREATE POLICY "Users can delete their own company" 
ON public.companies 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add DELETE policy for profiles table (also missing)
CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = user_id);