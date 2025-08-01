-- Update the profile with correct information
UPDATE profiles 
SET 
  full_name = 'مدير النظام',
  email = 'admin@tecnofootball.dz'
WHERE user_id = '9b6fbca3-12f6-4d47-adf4-e5f349bf6ea2';

-- Also update the user metadata to ensure consistency
UPDATE auth.users 
SET raw_user_meta_data = '{"full_name": "مدير النظام", "role": "director"}'::jsonb
WHERE id = '9b6fbca3-12f6-4d47-adf4-e5f349bf6ea2';