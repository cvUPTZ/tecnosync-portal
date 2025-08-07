-- Insert the admin user into platform_admins table
INSERT INTO public.platform_admins (id, email) 
VALUES ('2a5ba246-4298-41b1-a88b-0db955443-7f2', 'admin@techconsync.com')
ON CONFLICT (id) DO NOTHING;