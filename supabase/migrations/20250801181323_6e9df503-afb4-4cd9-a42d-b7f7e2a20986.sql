-- Create first admin user via Supabase Auth API
-- This user will be created with the trigger automatically creating the profile

-- First, let's make sure we can create users manually by temporarily allowing it
INSERT INTO profiles (user_id, full_name, email, role, is_active)
VALUES (
  '00000000-1111-2222-3333-444444444444'::uuid,
  'مدير النظام',
  'admin@tecnofootball.dz',
  'director'::app_role,
  true
);

-- Update the created_at and updated_at timestamps
UPDATE profiles 
SET created_at = now(), updated_at = now()
WHERE user_id = '00000000-1111-2222-3333-444444444444'::uuid;