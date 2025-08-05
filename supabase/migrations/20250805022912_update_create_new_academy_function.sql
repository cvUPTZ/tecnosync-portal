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
CREATE OR REPLACE FUNCTION public.create_new_academy(
  academy_name TEXT,
  academy_subdomain TEXT,
  admin_full_name TEXT,
  admin_email TEXT,
  admin_password TEXT,
  modules_config JSONB DEFAULT '{}'::jsonb
)
RETURNS RECORD -- Returns a record with the new academy's info
LANGUAGE plpgsql
SECURITY DEFINER -- Essential to have the power to create users and insert into restricted tables.
SET search_path = public, auth;
AS $$
DECLARE
  new_user_id UUID;
  new_academy RECORD;
BEGIN
  -- Check if the calling user is a platform admin.
  -- This is a critical security check.
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Only platform admins can create new academies.';
  END IF;

  -- Create the new academy
  INSERT INTO public.academies (name, subdomain, modules)
  VALUES (academy_name, academy_subdomain, modules_config)
  RETURNING id, name, subdomain INTO new_academy;

  -- Create the new user in auth.users
  new_user_id := gen_random_uuid();
  INSERT INTO auth.users (id, email, encrypted_password, aud, role, raw_user_meta_data, email_confirmed_at, created_at, updated_at)
  VALUES (
    new_user_id,
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    'authenticated',
    'authenticated',
    jsonb_build_object(
      'full_name', admin_full_name
    ),
    now(), -- email_confirmed_at
    now(),
    now()
  );

  -- Create the auth.identities entry
  INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    new_user_id,
    new_user_id, -- provider_id is user_id for email/password
    'email',
    jsonb_build_object('sub', new_user_id),
    now(),
    now()
  );

  -- Link the new user to the new academy in the public.profiles table
  INSERT INTO public.profiles (user_id, full_name, email, role, academy_id)
  VALUES (
    new_user_id,
    admin_full_name,
    admin_email,
    'director',
    new_academy.id
  );

  -- Seed default public pages for the new academy
  INSERT INTO public.public_pages (academy_id, slug, title, content)
  VALUES
    (new_academy.id, 'homepage', 'Welcome to ' || new_academy.name, '{"subtitle": "Your new home for football excellence."}'),
    (new_academy.id, 'about-us', 'About ' || new_academy.name, '{"introduction": "This is the about page for your new academy. You can edit this content from the admin dashboard."}');

  RETURN new_academy;
END;
$$;
