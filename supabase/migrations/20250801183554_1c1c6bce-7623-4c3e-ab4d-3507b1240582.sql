-- Delete existing user and recreate with simple password
DELETE FROM auth.users WHERE email = 'admin@tecnofootball.dz';
DELETE FROM profiles WHERE email = 'admin@tecnofootball.dz';

-- Create new admin user with simple password
DO $$
DECLARE
    user_id uuid := gen_random_uuid();
BEGIN
    -- Insert into auth.users with simple password
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
        user_id,
        'authenticated',
        'authenticated', 
        'admin@tecnofootball.dz',
        crypt('123456', gen_salt('bf')),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"full_name": "مدير النظام", "role": "director"}',
        now(),
        now(),
        false
    );

    -- Insert identity
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
        'admin@tecnofootball.dz',
        user_id,
        format('{"sub":"%s","email":"%s"}', user_id, 'admin@tecnofootball.dz')::jsonb,
        'email',
        now(),
        now(),
        now(),
        gen_random_uuid()
    );

    RAISE NOTICE 'Admin user created with simple password';
END $$;