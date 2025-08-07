-- Drop all existing policies first
DROP POLICY IF EXISTS "Enable read access for platform admins" ON public.platform_admins;
DROP POLICY IF EXISTS "Platform admins can manage all platform admin records" ON public.platform_admins;
DROP POLICY IF EXISTS "Users can read own platform_admin record" ON public.platform_admins;
DROP POLICY IF EXISTS "temp_allow_all" ON public.platform_admins;

-- Create simple policies to prevent infinite recursion
CREATE POLICY "Users can read their own admin record"
ON public.platform_admins
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own admin record"
ON public.platform_admins
FOR INSERT
WITH CHECK (auth.uid() = id);