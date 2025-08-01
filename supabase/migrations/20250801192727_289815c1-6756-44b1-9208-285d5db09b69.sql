-- Create attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused')),
  notes TEXT,
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, session_date)
);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create policies for attendance
CREATE POLICY "Users can view attendance records" 
ON public.attendance 
FOR SELECT 
USING (get_current_user_role() IN ('director', 'comptabilite_chief', 'coach'));

CREATE POLICY "Coaches and admins can insert attendance" 
ON public.attendance 
FOR INSERT 
WITH CHECK (get_current_user_role() IN ('director', 'comptabilite_chief', 'coach'));

CREATE POLICY "Coaches and admins can update attendance" 
ON public.attendance 
FOR UPDATE 
USING (get_current_user_role() IN ('director', 'comptabilite_chief', 'coach'));

CREATE POLICY "Only admins can delete attendance" 
ON public.attendance 
FOR DELETE 
USING (is_admin());

-- Create training sessions table
CREATE TABLE public.training_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.student_groups(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  coach_id UUID REFERENCES auth.users(id),
  location VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for training sessions
CREATE POLICY "Users can view training sessions" 
ON public.training_sessions 
FOR SELECT 
USING (get_current_user_role() IN ('director', 'comptabilite_chief', 'coach'));

CREATE POLICY "Coaches and admins can manage training sessions" 
ON public.training_sessions 
FOR ALL 
USING (get_current_user_role() IN ('director', 'comptabilite_chief', 'coach'));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_attendance_updated_at
BEFORE UPDATE ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_sessions_updated_at
BEFORE UPDATE ON public.training_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_attendance_student_date ON public.attendance(student_id, session_date);
CREATE INDEX idx_attendance_session_date ON public.attendance(session_date);
CREATE INDEX idx_training_sessions_date_group ON public.training_sessions(session_date, group_id);

-- Insert some sample training sessions for testing
INSERT INTO public.training_sessions (group_id, session_date, start_time, end_time, title, description, location) 
SELECT 
  sg.id,
  CURRENT_DATE,
  '16:00'::TIME,
  '17:30'::TIME,
  'تدريب مساء اليوم',
  'تدريب اعتيادي للمجموعة',
  'الملعب الرئيسي'
FROM public.student_groups sg 
WHERE sg.is_active = true
LIMIT 3;