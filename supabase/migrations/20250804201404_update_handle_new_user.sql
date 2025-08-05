-- Update the function to handle new user profile creation with academy_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role, academy_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'coach'),
    (NEW.raw_user_meta_data ->> 'academy_id')::uuid
  );
  RETURN NEW;
END;
$$;
