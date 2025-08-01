-- Create a function to automatically confirm emails for admin-created users
CREATE OR REPLACE FUNCTION public.confirm_admin_created_users()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If this user was created with metadata indicating admin creation
  -- or if they have specific roles that should be auto-confirmed
  IF (NEW.raw_user_meta_data ->> 'admin_created')::boolean = true 
     OR (NEW.raw_user_meta_data ->> 'role') IN ('director', 'comptabilite_chief', 'coach') THEN
    
    -- Mark email as confirmed
    UPDATE auth.users 
    SET email_confirmed_at = NOW()
    WHERE id = NEW.id AND email_confirmed_at IS NULL;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-confirm admin created users
DROP TRIGGER IF EXISTS auto_confirm_admin_users ON auth.users;
CREATE TRIGGER auto_confirm_admin_users
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.confirm_admin_created_users();

-- Also disable email confirmation in Supabase Auth settings
-- Note: This requires manual configuration in Supabase dashboard:
-- Go to Authentication > Settings > Email Confirmation and set it to "Disabled" for admin-created users