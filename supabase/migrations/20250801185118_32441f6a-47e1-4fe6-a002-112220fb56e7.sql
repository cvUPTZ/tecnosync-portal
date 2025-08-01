-- Simple approach: create user and profile separately
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
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change_token_current,
    reauthentication_token,
    is_anonymous
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'authenticated',
    'authenticated',
    'admin@tecnofootball.dz',
    crypt('123456', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "مدير النظام", "role": "director"}',
    now(),
    now(),
    '',
    '',
    '',
    '',
    '',
    false
);

-- Create the profile
INSERT INTO profiles (
    user_id,
    full_name, 
    email,
    role,
    is_active
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'مدير النظام',
    'admin@tecnofootball.dz', 
    'director',
    true
);