-- Migration to fix RLS policies for platform admins

-- The existing RLS policies are too restrictive and do not account for the platform_admin role.
-- This migration updates the key policies to grant platform admins the necessary access.

-- 1. Update RLS policy on public.academies
-- The existing policy from a previous migration only covers SELECT. We need full access.
DROP POLICY IF EXISTS "Platform admins can manage academies" ON public.academies;
CREATE POLICY "Platform admins can manage academies"
ON public.academies
FOR ALL
USING (public.is_platform_admin())
WITH CHECK (public.is_platform_admin());

-- 2. Update RLS policy on public.profiles
-- This allows platform admins to see all user profiles, which is necessary for user management.
DROP POLICY IF EXISTS "Admins can view profiles in their academy" ON public.profiles;
CREATE POLICY "Admins can view profiles in their academy" ON public.profiles
  FOR SELECT USING (
    (get_current_user_role() IN ('director', 'comptabilite_chief') AND academy_id = get_academy_id_from_user(auth.uid()))
    OR public.is_platform_admin()
  );

DROP POLICY IF EXISTS "Admins can update profiles in their academy" ON public.profiles;
CREATE POLICY "Admins can update profiles in their academy" ON public.profiles
  FOR UPDATE USING (
    (get_current_user_role() IN ('director', 'comptabilite_chief') AND academy_id = get_academy_id_from_user(auth.uid()))
    OR public.is_platform_admin()
  ) WITH CHECK (
    (get_current_user_role() IN ('director', 'comptabilite_chief') AND academy_id = get_academy_id_from_user(auth.uid()))
    OR public.is_platform_admin()
  );

-- Allow platform admins to insert new profiles (e.g., for other admins)
DROP POLICY IF EXISTS "Admins can insert profiles for their academy" ON public.profiles;
CREATE POLICY "Admins can insert profiles for their academy" ON public.profiles
  FOR INSERT WITH CHECK (
    (get_current_user_role() IN ('director', 'comptabilite_chief') AND profiles.academy_id = get_academy_id_from_user(auth.uid()))
    OR public.is_platform_admin()
  );

RAISE NOTICE 'RLS policies for platform admins have been updated.';
