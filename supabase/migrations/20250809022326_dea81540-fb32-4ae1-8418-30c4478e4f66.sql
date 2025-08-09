-- Fix remaining function search_path security issues

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;