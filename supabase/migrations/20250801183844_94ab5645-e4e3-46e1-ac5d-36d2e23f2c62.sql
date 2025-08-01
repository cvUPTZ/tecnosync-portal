-- Delete the problematic user completely
DELETE FROM auth.identities WHERE provider_id = 'admin@tecnofootball.dz';
DELETE FROM profiles WHERE email = 'admin@tecnofootball.dz';
DELETE FROM auth.users WHERE email = 'admin@tecnofootball.dz';