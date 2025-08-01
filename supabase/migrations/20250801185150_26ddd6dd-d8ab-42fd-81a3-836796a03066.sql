-- Update the existing user to be an admin
UPDATE profiles 
SET 
  role = 'director',
  full_name = 'مدير النظام'
WHERE email = 'excelzed@gmail.com';