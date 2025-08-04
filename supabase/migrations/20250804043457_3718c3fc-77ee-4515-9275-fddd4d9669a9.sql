-- Update the create_new_academy function to actually create the admin user
CREATE OR REPLACE FUNCTION public.create_new_academy(
    academy_name text, 
    academy_subdomain text, 
    admin_full_name text, 
    admin_email text, 
    admin_password text, 
    modules_config jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    new_academy_id uuid;
    new_user_id uuid;
    result JSONB;
BEGIN
    -- Check if admin email already exists in profiles
    IF EXISTS (SELECT 1 FROM profiles WHERE email = admin_email) THEN
        RAISE EXCEPTION 'User with email "%" already exists', admin_email;
    END IF;

    -- Check if subdomain already exists
    IF EXISTS (SELECT 1 FROM academies WHERE subdomain = academy_subdomain) THEN
        RAISE EXCEPTION 'Subdomain "%" already exists', academy_subdomain;
    END IF;

    -- Generate a new user ID
    new_user_id := gen_random_uuid();

    -- Insert the academy first
    INSERT INTO public.academies (name, subdomain, modules, is_active)
    VALUES (academy_name, academy_subdomain, modules_config, true)
    RETURNING id INTO new_academy_id;

    -- Insert the profile for the admin user
    INSERT INTO public.profiles (
        user_id, 
        full_name, 
        email, 
        role, 
        academy_id,
        is_active
    ) VALUES (
        new_user_id,
        admin_full_name,
        admin_email,
        'director'::app_role,
        new_academy_id,
        true
    );

    -- Create default website settings for the academy
    INSERT INTO public.website_settings (
        academy_id,
        template,
        primary_color,
        seo_settings,
        social_media
    ) VALUES (
        new_academy_id,
        'classic',
        '#1e40af',
        jsonb_build_object(
            'meta_title', academy_name,
            'meta_description', 'Welcome to ' || academy_name || ' - Excellence in sports training and development.',
            'meta_keywords', 'sports,training,academy,football,coaching'
        ),
        jsonb_build_object(
            'facebook', '',
            'twitter', '',
            'instagram', '',
            'linkedin', ''
        )
    );

    -- Create default pages for the academy
    INSERT INTO public.public_pages (academy_id, slug, title, content, is_published) VALUES
    (new_academy_id, 'homepage', academy_name, jsonb_build_object(
        'hero_title', academy_name,
        'hero_subtitle', 'Excellence in Sports Training and Development',
        'hero_description', 'Join our academy and take your skills to the next level with professional coaching and state-of-the-art facilities.',
        'features', jsonb_build_array(
            jsonb_build_object('title', 'Professional Coaching', 'description', 'Learn from experienced and certified coaches'),
            jsonb_build_object('title', 'Modern Facilities', 'description', 'Train in world-class facilities with the latest equipment'),
            jsonb_build_object('title', 'Flexible Programs', 'description', 'Choose from various programs suitable for all skill levels')
        )
    ), true),
    (new_academy_id, 'about-us', 'About Us', jsonb_build_object(
        'introduction', 'Welcome to ' || academy_name || ', where excellence meets passion in sports training.',
        'mission', 'Our mission is to develop talented athletes through comprehensive training programs and character building.',
        'vision', 'To be the leading sports academy that nurtures champions both on and off the field.',
        'values', jsonb_build_array('Excellence', 'Integrity', 'Teamwork', 'Dedication', 'Respect')
    ), true);

    result := jsonb_build_object(
        'academy_id', new_academy_id,
        'user_id', new_user_id,
        'academy_name', academy_name,
        'subdomain', academy_subdomain,
        'admin_email', admin_email,
        'admin_full_name', admin_full_name,
        'temp_password', admin_password,
        'public_url', 'https://preview--tecnosync-portal.lovable.app/academy/' || academy_subdomain,
        'admin_url', 'https://preview--tecnosync-portal.lovable.app/login',
        'message', 'Academy created successfully! Admin user profile created - they can now login with their email and password.'
    );

    RETURN result;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create academy: %', SQLERRM;
END;
$function$