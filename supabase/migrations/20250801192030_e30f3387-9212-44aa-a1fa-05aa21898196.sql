-- First, let's confirm all existing admin users (directors, comptabilite_chief, coaches)
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL 
  AND (
    (raw_user_meta_data ->> 'role') IN ('director', 'comptabilite_chief', 'coach')
    OR (raw_user_meta_data ->> 'admin_created')::boolean = true
  );

-- Let's also check if our trigger function is working correctly by improving it
CREATE OR REPLACE FUNCTION public.confirm_admin_created_users()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Log for debugging
  RAISE LOG 'New user created: %, metadata: %', NEW.id, NEW.raw_user_meta_data;
  
  -- If this user was created with metadata indicating admin creation
  -- or if they have specific roles that should be auto-confirmed
  IF (NEW.raw_user_meta_data ->> 'admin_created')::boolean = true 
     OR (NEW.raw_user_meta_data ->> 'role') IN ('director', 'comptabilite_chief', 'coach') THEN
    
    -- Mark email as confirmed immediately
    NEW.email_confirmed_at = NOW();
    RAISE LOG 'Auto-confirming email for admin user: %', NEW.id;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger to use BEFORE INSERT instead of AFTER INSERT
-- This way we can modify the NEW record directly
DROP TRIGGER IF EXISTS auto_confirm_admin_users ON auth.users;
CREATE TRIGGER auto_confirm_admin_users
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.confirm_admin_created_users();