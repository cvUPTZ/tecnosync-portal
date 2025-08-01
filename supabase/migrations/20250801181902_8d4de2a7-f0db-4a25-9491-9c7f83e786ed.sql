-- Create admin user manually in auth.users table
DO $$
DECLARE
    user_id uuid := gen_random_uuid();
BEGIN
    -- Insert into auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        invited_at,
        confirmation_token,
        confirmation_sent_at,
        recovery_token,
        recovery_sent_at,
        email_change_token_new,
        email_change,
        email_change_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at,
        is_sso_user,
        deleted_at,
        is_anonymous
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        user_id,
        'authenticated',
        'authenticated',
        'admin@tecnofootball.dz',
        crypt('admin123456', gen_salt('bf')),
        now(),
        now(),
        '',
        now(),
        '',
        null,
        '',
        '',
        null,
        null,
        '{"provider": "email", "providers": ["email"]}',
        '{"full_name": "مدير النظام", "role": "director"}',
        false,
        now(),
        now(),
        null,
        null,
        '',
        '',
        null,
        '',
        0,
        null,
        '',
        null,
        false,
        null,
        false
    );

    -- Insert into auth.identities
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

    RAISE NOTICE 'Admin user created with ID: %', user_id;
END $$;