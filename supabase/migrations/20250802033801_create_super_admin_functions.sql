-- Migration for creating platform admin functionality

-- 1. SQL function to check if the current user is a platform admin
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT raw_user_meta_data->>'role' INTO user_role
  FROM auth.users
  WHERE id = auth.uid();

  RETURN user_role = 'platform_admin';
END;
$$ LANGUAGE plpgsql SECURITY INVOKER; -- Can be invoker since it only checks the calling user's role

-- 2. RLS policy on the academies table
DROP POLICY IF EXISTS "Platform admins can manage academies" ON public.academies;
CREATE POLICY "Platform admins can manage academies"
ON public.academies
FOR ALL
USING (public.is_platform_admin())
WITH CHECK (public.is_platform_admin());

-- 3. The main function to create a new academy and its first admin user.
-- 3. The main function to create a new academy, to be called after the admin user has been created in auth.
CREATE OR REPLACE FUNCTION public.create_new_academy_with_user(
  academy_name TEXT,
  academy_subdomain TEXT,
  admin_full_name TEXT,
  admin_email TEXT,
  modules_config JSONB,
  user_id UUID
)
RETURNS RECORD -- Returns a record with the new academy's info
LANGUAGE plpgsql
SECURITY DEFINER -- Essential to have the power to insert into restricted tables.
SET search_path = public;
AS $$
DECLARE
  new_academy RECORD;
  platform_admin_check BOOLEAN;
BEGIN
  -- Security check: This function should be callable only by a user with platform_admin role.
  -- The check relies on the session's current user, which is appropriate when called from an edge function using the service role key.
  SELECT public.is_platform_admin() INTO platform_admin_check;
  IF NOT platform_admin_check THEN
    RAISE EXCEPTION 'Only platform admins can create new academies.';
  END IF;

  -- Create the new academy
  INSERT INTO public.academies (name, subdomain, modules)
  VALUES (academy_name, academy_subdomain, modules_config)
  RETURNING id, name, subdomain INTO new_academy;

  -- Link the provided user_id to the new academy in the public.profiles table
  INSERT INTO public.profiles (user_id, full_name, email, role, academy_id)
  VALUES (
    user_id,
    admin_full_name,
    admin_email,
    'director',
    new_academy.id
  );

  RETURN new_academy;
END;
$$;
