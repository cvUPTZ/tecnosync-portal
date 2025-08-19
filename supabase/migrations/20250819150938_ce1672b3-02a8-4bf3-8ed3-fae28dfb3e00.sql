-- Update the user's profile to associate them with the first academy
UPDATE profiles 
SET academy_id = '5a75b98c-650e-4b19-9702-ca7d5092e91f', 
    updated_at = now()
WHERE user_id = '6296cddc-5363-4a55-af4a-31bc3c11edf7';

-- Also update the website content management to handle cases where user has no academy_id initially
-- by providing better error handling and academy selection