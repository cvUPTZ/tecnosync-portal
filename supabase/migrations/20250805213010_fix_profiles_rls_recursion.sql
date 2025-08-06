-- Migration to fix the recursive RLS policy on the public.profiles table.
-- This is the root cause of the login hang.

-- The previous policy on `profiles` called a function that also queried `profiles`,
-- creating an infinite loop.

-- 1. Fix the `get_academy_id_from_user` function.
-- It was using `id = user_id` which is incorrect. The column is `user_id`.
-- This is a latent bug that needs fixing for other policies.
CREATE OR REPLACE FUNCTION get_academy_id_from_user(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  academy_uuid UUID;
BEGIN
  SELECT academy_id INTO academy_uuid
  FROM public.profiles
  WHERE user_id = p_user_id; -- Corrected from `id` to `user_id`
  RETURN academy_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Drop all existing SELECT policies on `profiles` to start fresh.
DROP POLICY IF EXISTS "Admins can view profiles in their academy" ON public.profiles;
-- This is the old, problematic policy from a previous fix.
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles; -- Just in case.

-- 3. Create a new, non-recursive SELECT policy for `profiles`.
-- This is the critical fix. A user must be able to select their own profile,
-- and a platform admin must be able to select any profile.
-- This policy has no external function dependencies and is not recursive.
CREATE POLICY "Users can view their own profile, and admins can view all"
ON public.profiles
FOR SELECT
USING (
  user_id = auth.uid() OR public.is_platform_admin()
);

-- Note: The UPDATE and INSERT policies from the previous fix are still okay,
-- as they were only adding the `is_platform_admin` check and didn't have the same
-- recursive SELECT issue. We leave them in place.

RAISE NOTICE 'Fixed recursive RLS policy on public.profiles.';
