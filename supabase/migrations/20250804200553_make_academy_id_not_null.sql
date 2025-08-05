-- This migration ensures that every profile is associated with an academy.

-- Step 1: Update existing profiles that have a NULL academy_id.
-- We use a placeholder UUID here. Please replace this with a valid academy ID
-- from your academies table if you have existing users.
UPDATE public.profiles
SET academy_id = '00000000-0000-0000-0000-000000000000'
WHERE academy_id IS NULL;

-- Step 2: Alter the column to be NOT NULL.
ALTER TABLE public.profiles
ALTER COLUMN academy_id SET NOT NULL;
