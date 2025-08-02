-- Migration to create a default platform super admin user

DO $$
DECLARE
    user_id UUID;
    super_admin_email TEXT := 'superadmin@creator.com';
BEGIN
    -- Check if the user already exists to make this migration re-runnable
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = super_admin_email) THEN
        RAISE NOTICE 'Super admin user already exists.';
        RETURN;
    END IF;

    -- 1. Create the user in auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        is_anonymous
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        super_admin_email,
        crypt('password', gen_salt('bf')), -- Simple password for development
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"full_name": "Platform Admin", "role": "platform_admin"}',
        now(),
        now(),
        false
    ) RETURNING id INTO user_id;

    -- 2. Create the identity entry
    INSERT INTO auth.identities (
        provider_id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at,
        id
    ) VALUES (
        user_id, -- For email provider, provider_id is the user_id
        user_id,
        format('{"sub":"%s","email":"%s"}', user_id, super_admin_email)::jsonb,
        'email',
        now(),
        now(),
        now(),
        gen_random_uuid()
    );

    -- 3. Create the corresponding profile
    -- Note: academy_id is left NULL for the platform admin
    INSERT INTO public.profiles (user_id, full_name, email, role)
    VALUES (
      user_id,
      'Platform Admin',
      super_admin_email,
      'platform_admin'
    );

    RAISE NOTICE 'Platform super admin user created successfully.';
END $$;
