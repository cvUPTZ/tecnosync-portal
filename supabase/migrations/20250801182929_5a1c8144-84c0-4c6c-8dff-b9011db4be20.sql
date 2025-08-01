-- Create student groups table for classification
CREATE TABLE public.student_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  min_age INTEGER NOT NULL,
  max_age INTEGER NOT NULL,
  max_capacity INTEGER DEFAULT 20,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_code VARCHAR(20) UNIQUE NOT NULL,
  registration_id UUID REFERENCES public.registrations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  full_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  nationality VARCHAR(50) NOT NULL,
  gender VARCHAR(10) CHECK (gender IN ('ذكر', 'أنثى')),
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT NOT NULL,
  
  -- Parent/Guardian Information
  parent_name VARCHAR(100),
  parent_phone VARCHAR(20),
  parent_email VARCHAR(100),
  parent_id_number VARCHAR(20),
  parent_profession VARCHAR(100),
  
  -- Emergency Contact
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relation VARCHAR(50),
  
  -- Football Information
  position VARCHAR(50),
  preferred_foot VARCHAR(10) CHECK (preferred_foot IN ('يمين', 'يسار', 'كلاهما')),
  previous_experience TEXT,
  shirt_number INTEGER,
  
  -- Medical Information
  medical_conditions TEXT,
  allergies TEXT,
  blood_type VARCHAR(5),
  doctor_name VARCHAR(100),
  doctor_phone VARCHAR(20),
  
  -- Academic Information (for young players)
  school_name VARCHAR(100),
  school_grade VARCHAR(20),
  academic_performance VARCHAR(20) CHECK (academic_performance IN ('ممتاز', 'جيد جداً', 'جيد', 'مقبول')),
  
  -- Enrollment Information
  group_id UUID REFERENCES public.student_groups(id) ON DELETE SET NULL,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'graduated')),
  
  -- Payment Information
  monthly_fee DECIMAL(10,2),
  payment_status VARCHAR(20) DEFAULT 'current' CHECK (payment_status IN ('current', 'overdue', 'exempt')),
  
  -- Additional Information
  photo_url TEXT,
  notes TEXT,
  achievements TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create student enrollments table for tracking enrollment history
CREATE TABLE public.student_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.student_groups(id) ON DELETE CASCADE,
  enrollment_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(student_id, group_id, enrollment_date)
);

-- Enable Row Level Security
ALTER TABLE public.student_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;

-- Create policies for student_groups
CREATE POLICY "student_groups_select" ON public.student_groups
  FOR SELECT USING (true);

CREATE POLICY "student_groups_insert" ON public.student_groups
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "student_groups_update" ON public.student_groups
  FOR UPDATE USING (is_admin());

-- Create policies for students
CREATE POLICY "students_select_all" ON public.students
  FOR SELECT USING (
    is_admin() OR 
    get_current_user_role() = 'coach' OR
    user_id = auth.uid()
  );

CREATE POLICY "students_insert" ON public.students
  FOR INSERT WITH CHECK (is_admin() OR get_current_user_role() = 'coach');

CREATE POLICY "students_update" ON public.students
  FOR UPDATE USING (
    is_admin() OR 
    get_current_user_role() = 'coach' OR
    user_id = auth.uid()
  );

CREATE POLICY "students_delete" ON public.students
  FOR DELETE USING (is_admin());

-- Create policies for student_enrollments
CREATE POLICY "enrollments_select" ON public.student_enrollments
  FOR SELECT USING (
    is_admin() OR 
    get_current_user_role() = 'coach'
  );

CREATE POLICY "enrollments_insert" ON public.student_enrollments
  FOR INSERT WITH CHECK (is_admin() OR get_current_user_role() = 'coach');

CREATE POLICY "enrollments_update" ON public.student_enrollments
  FOR UPDATE USING (is_admin() OR get_current_user_role() = 'coach');

-- Create indexes for better performance
CREATE INDEX idx_students_student_code ON public.students(student_code);
CREATE INDEX idx_students_group_id ON public.students(group_id);
CREATE INDEX idx_students_status ON public.students(status);
CREATE INDEX idx_students_enrollment_date ON public.students(enrollment_date);
CREATE INDEX idx_enrollments_student_id ON public.student_enrollments(student_id);
CREATE INDEX idx_enrollments_group_id ON public.student_enrollments(group_id);

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_student_groups_updated_at
  BEFORE UPDATE ON public.student_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique student code
CREATE OR REPLACE FUNCTION public.generate_student_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  year_suffix TEXT;
  counter INTEGER;
BEGIN
  -- Get current year suffix (e.g., 25 for 2025)
  year_suffix := EXTRACT(year FROM CURRENT_DATE)::TEXT;
  year_suffix := RIGHT(year_suffix, 2);
  
  -- Get the count of students this year + 1
  SELECT COUNT(*) + 1 INTO counter
  FROM students 
  WHERE student_code LIKE 'TFA' || year_suffix || '%';
  
  -- Format: TFA + YY + 4-digit number (e.g., TFA250001)
  new_code := 'TFA' || year_suffix || LPAD(counter::TEXT, 4, '0');
  
  -- Check if code already exists (safety check)
  WHILE EXISTS(SELECT 1 FROM students WHERE student_code = new_code) LOOP
    counter := counter + 1;
    new_code := 'TFA' || year_suffix || LPAD(counter::TEXT, 4, '0');
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Insert default student groups
INSERT INTO public.student_groups (name, description, min_age, max_age, max_capacity) VALUES
('أشبال (6-8 سنوات)', 'المجموعة الأساسية للأطفال الصغار - تعلم الأساسيات', 6, 8, 15),
('براعم (9-11 سنة)', 'تطوير المهارات الأساسية والتكتيكات البسيطة', 9, 11, 18),
('ناشئين (12-14 سنة)', 'تطوير التكتيكات والمهارات المتقدمة', 12, 14, 20),
('شباب (15-17 سنة)', 'الإعداد للمستوى الاحترافي والمنافسات الجدية', 15, 17, 22),
('رجال (+18 سنة)', 'فريق الكبار والمباريات الاحترافية', 18, 50, 25);