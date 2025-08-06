-- Enable Row Level Security on platform_admins table
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

-- Create policies for platform_admins table
-- Only platform admins can view the platform_admins table
CREATE POLICY "Platform admins can view platform admins table" 
ON public.platform_admins 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.platform_admins 
    WHERE id = auth.uid()
  )
);

-- Only existing platform admins can manage other platform admin records
CREATE POLICY "Platform admins can manage platform admins" 
ON public.platform_admins 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 
    FROM public.platform_admins 
    WHERE id = auth.uid()
  )
);

-- Create a security definer function to check if user is platform admin
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.platform_admins
    WHERE id = auth.uid()
  );
$$;