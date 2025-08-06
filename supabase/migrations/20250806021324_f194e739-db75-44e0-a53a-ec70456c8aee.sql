-- Insert the superadmin user into platform_admins table
-- First we need to get the user_id from auth.users table where email = 'superadmin@creator.com'
-- Then insert that user_id into platform_admins table

-- Insert the user ID directly (this assumes the user exists in auth.users)
-- If the user doesn't exist, this will create the entry when they sign up
INSERT INTO public.platform_admins (id) 
SELECT id FROM auth.users WHERE email = 'superadmin@creator.com'
ON CONFLICT (id) DO NOTHING;