-- Fix infinite recursion in platform_admins RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Platform admins can manage platform admins" ON public.platform_admins;
DROP POLICY IF EXISTS "Platform admins can read all platform admin records" ON public.platform_admins;
DROP POLICY IF EXISTS "Platform admins can read all records" ON public.platform_admins;
DROP POLICY IF EXISTS "Platform admins can view platform admins table" ON public.platform_admins;

-- Create or replace the security definer function for platform admin check
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

-- Create new safe policies for platform_admins table
CREATE POLICY "Enable read access for platform admins"
ON public.platform_admins
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Platform admins can manage all platform admin records"
ON public.platform_admins
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.platform_admins pa
    WHERE pa.id = auth.uid()
  )
);