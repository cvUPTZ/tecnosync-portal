-- CRITICAL SECURITY FIXES

-- 1. Enable RLS on profiles table (currently disabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on tables missing RLS policies
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

-- 3. Add comprehensive RLS policies for student_enrollments
CREATE POLICY "Academy users can view their academy student enrollments"
ON public.student_enrollments
FOR SELECT
USING (
  student_id IN (
    SELECT id FROM public.students 
    WHERE EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND (
        academy_id = (SELECT academy_id FROM public.profiles WHERE user_id = (SELECT user_id FROM public.students WHERE id = student_enrollments.student_id LIMIT 1))
        OR role = 'platform_admin'::app_role
      )
    )
  )
);

CREATE POLICY "Academy admins can manage their academy student enrollments"
ON public.student_enrollments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.students s ON s.id = student_enrollments.student_id
    WHERE p.user_id = auth.uid() 
    AND (
      (p.academy_id IS NOT NULL AND s.user_id IS NOT NULL) -- Academy admin managing their academy
      OR p.role = 'platform_admin'::app_role -- Platform admin
    )
  )
);

-- 4. Add comprehensive RLS policies for training_sessions
CREATE POLICY "Academy users can view their academy training sessions"
ON public.training_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (
      academy_id IS NOT NULL -- Users can see sessions from their academy
      OR role = 'platform_admin'::app_role -- Platform admins see all
    )
  )
);

CREATE POLICY "Academy admins can manage their academy training sessions"
ON public.training_sessions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (
      role IN ('director', 'coach')::app_role -- Directors and coaches can manage
      OR role = 'platform_admin'::app_role -- Platform admins can manage all
    )
  )
);

-- 5. Fix database functions with proper search_path (Security Issue)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role::text
  FROM public.profiles 
  WHERE user_id = auth.uid()
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.is_platform_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.platform_admins
    WHERE id = auth.uid()
  );
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
      AND role = _role
      AND is_active = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
      AND role IN ('director', 'comptabilite_chief')
      AND is_active = true
  );
$function$;

-- 6. Add attendance table RLS policies (was missing policies)
CREATE POLICY "Academy users can view their academy attendance"
ON public.attendance
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.students s ON s.id = attendance.student_id
    WHERE p.user_id = auth.uid() 
    AND (
      p.academy_id IS NOT NULL -- Users from same academy
      OR p.role = 'platform_admin'::app_role -- Platform admins
    )
  )
);

CREATE POLICY "Academy admins can manage attendance"
ON public.attendance
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('director', 'coach')::app_role
  )
);

CREATE POLICY "Academy admins can update attendance"
ON public.attendance
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('director', 'coach')::app_role
  )
);

-- 7. Enhanced document access logging function
CREATE OR REPLACE FUNCTION public.log_document_access(p_document_id uuid, p_action text, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Log the access
  INSERT INTO public.document_access_log (
    document_id,
    user_id,
    action,
    ip_address,
    user_agent
  ) VALUES (
    p_document_id,
    auth.uid(),
    p_action,
    p_ip_address,
    p_user_agent
  );
  
  -- Alert on suspicious activity (multiple rapid downloads)
  IF p_action = 'download' THEN
    PERFORM pg_notify(
      'document_access_alert',
      json_build_object(
        'user_id', auth.uid(),
        'document_id', p_document_id,
        'action', p_action,
        'timestamp', now()
      )::text
    );
  END IF;
END;
$function$;

-- 8. Create admin action logging table for audit trail
CREATE TABLE IF NOT EXISTS public.admin_action_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id uuid NOT NULL,
    action_type text NOT NULL,
    target_table text,
    target_id uuid,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.admin_action_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only platform admins can view admin logs"
ON public.admin_action_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'platform_admin'::app_role
  )
);

CREATE POLICY "System can insert admin logs"
ON public.admin_action_log
FOR INSERT
WITH CHECK (true);

-- 9. Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action_type text,
  p_target_table text DEFAULT NULL,
  p_target_id uuid DEFAULT NULL,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL
) RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.admin_action_log (
    admin_user_id,
    action_type,
    target_table,
    target_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    p_action_type,
    p_target_table,
    p_target_id,
    p_old_values,
    p_new_values
  );
END;
$function$;