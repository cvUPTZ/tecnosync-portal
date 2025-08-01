-- Fix the trigger function to handle role casting properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    user_role public.app_role;
BEGIN
    -- Safely cast the role or default to 'coach'
    user_role := COALESCE((NEW.raw_user_meta_data ->> 'role')::public.app_role, 'coach'::public.app_role);
    
    INSERT INTO public.profiles (user_id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
        NEW.email,
        user_role
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- If role casting fails, use default 'coach' role
        INSERT INTO public.profiles (user_id, full_name, email, role)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
            NEW.email,
            'coach'::public.app_role
        );
        RETURN NEW;
END;
$$;

-- Re-create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();