-- New, consolidated RLS policies for authentication and authorization.
-- This migration drops previous policies and creates a clean, authoritative set.

-- Helper function to get the role from the user's JWT.
-- This is more reliable than querying the profiles table in RLS policies.
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT raw_user_meta_data->>'role' INTO user_role
  FROM auth.users
  WHERE id = p_user_id;
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;


-- Helper function to check if the currently authenticated user is a platform admin.
-- Re-defined for clarity and to ensure it's up-to-date.
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT get_user_role(auth.uid())
  ) = 'platform_admin';
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- 1. Refactor policies for the 'profiles' table
-- First, remove all existing policies to start fresh.
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view profiles in their academy" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles in their academy" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles for their academy" ON public.profiles;

-- Allow users to view their own profile.
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to update their own profile.
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow platform admins to manage all profiles.
CREATE POLICY "Platform admins can manage all profiles"
ON public.profiles FOR ALL
USING (public.is_platform_admin())
WITH CHECK (public.is_platform_admin());

-- Allow academy directors to manage profiles within their own academy.
CREATE POLICY "Directors can manage profiles in their academy"
ON public.profiles FOR ALL
USING (
  get_user_role(auth.uid()) = 'director' AND
  academy_id = (SELECT academy_id FROM public.profiles WHERE user_id = auth.uid())
)
WITH CHECK (
  get_user_role(auth.uid()) = 'director' AND
  academy_id = (SELECT academy_id FROM public.profiles WHERE user_id = auth.uid())
);


-- 2. Refactor policies for the 'academies' table
-- First, remove all existing policies.
DROP POLICY IF EXISTS "Platform admins can manage academies" ON public.academies;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.academies;

-- Allow platform admins to manage all academies.
CREATE POLICY "Platform admins can manage all academies"
ON public.academies FOR ALL
USING (public.is_platform_admin())
WITH CHECK (public.is_platform_admin());

-- Allow authenticated users (e.g., academy admins) to view their own academy's details.
CREATE POLICY "Authenticated users can view their own academy"
ON public.academies FOR SELECT
USING (
  id = (SELECT academy_id FROM public.profiles WHERE user_id = auth.uid())
);

RAISE NOTICE 'Authentication RLS policies have been successfully refactored.';
