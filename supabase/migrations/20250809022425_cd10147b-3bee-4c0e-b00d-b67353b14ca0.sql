-- Fix remaining academy creation functions

CREATE OR REPLACE FUNCTION public.get_academy_id_from_user(p_user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    academy_uuid UUID;
BEGIN
    -- Select using the 'user_id' column to match the input parameter
    -- This corrects a potential bug if the original used 'id = p_user_id'
    SELECT academy_id INTO academy_uuid
    FROM public.profiles
    WHERE user_id = p_user_id; -- Match profile's user_id column

    RETURN academy_uuid;
END;
$function$;

CREATE OR REPLACE FUNCTION public.confirm_admin_created_users()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;