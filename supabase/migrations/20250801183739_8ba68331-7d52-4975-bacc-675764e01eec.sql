-- Fix the confirmation_token NULL issue
UPDATE auth.users 
SET 
  confirmation_token = '',
  confirmation_sent_at = now(),
  recovery_token = '',
  email_change_token_new = '',
  email_change_token_current = '',
  reauthentication_token = ''
WHERE email = 'admin@tecnofootball.dz';