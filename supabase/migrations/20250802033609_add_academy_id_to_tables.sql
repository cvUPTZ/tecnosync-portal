-- Migration to add academy_id to all tenant-specific tables

-- It's often safer to add the column as nullable, then backfill data, then set to NOT NULL.
-- For this project, we assume we're starting fresh, but this is best practice.

-- Function to get the academy_id from a user's profile
CREATE OR REPLACE FUNCTION get_academy_id_from_user(user_id UUID)
RETURNS UUID AS $$
DECLARE
  academy_uuid UUID;
BEGIN
  SELECT academy_id INTO academy_uuid
  FROM public.profiles
  WHERE id = user_id;
  RETURN academy_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles
-- Profiles table links auth.users to an academy
ALTER TABLE public.profiles ADD COLUMN academy_id UUID;
ALTER TABLE public.profiles
  ADD CONSTRAINT fk_profiles_academy_id
  FOREIGN KEY (academy_id) REFERENCES public.academies(id) ON DELETE CASCADE;
CREATE INDEX idx_profiles_academy_id ON public.profiles(academy_id);
COMMENT ON COLUMN public.profiles.academy_id IS 'The academy this user profile belongs to.';

-- 2. Registrations
ALTER TABLE public.registrations ADD COLUMN academy_id UUID;
ALTER TABLE public.registrations
  ADD CONSTRAINT fk_registrations_academy_id
  FOREIGN KEY (academy_id) REFERENCES public.academies(id) ON DELETE CASCADE;
CREATE INDEX idx_registrations_academy_id ON public.registrations(academy_id);

-- 3. Students
ALTER TABLE public.students ADD COLUMN academy_id UUID;
ALTER TABLE public.students
  ADD CONSTRAINT fk_students_academy_id
  FOREIGN KEY (academy_id) REFERENCES public.academies(id) ON DELETE CASCADE;
CREATE INDEX idx_students_academy_id ON public.students(academy_id);

-- 4. Student Groups
ALTER TABLE public.student_groups ADD COLUMN academy_id UUID;
ALTER TABLE public.student_groups
  ADD CONSTRAINT fk_student_groups_academy_id
  FOREIGN KEY (academy_id) REFERENCES public.academies(id) ON DELETE CASCADE;
CREATE INDEX idx_student_groups_academy_id ON public.student_groups(academy_id);

-- 5. Student Enrollments
ALTER TABLE public.student_enrollments ADD COLUMN academy_id UUID;
ALTER TABLE public.student_enrollments
  ADD CONSTRAINT fk_student_enrollments_academy_id
  FOREIGN KEY (academy_id) REFERENCES public.academies(id) ON DELETE CASCADE;
CREATE INDEX idx_student_enrollments_academy_id ON public.student_enrollments(academy_id);

-- 6. Training Sessions
ALTER TABLE public.training_sessions ADD COLUMN academy_id UUID;
ALTER TABLE public.training_sessions
  ADD CONSTRAINT fk_training_sessions_academy_id
  FOREIGN KEY (academy_id) REFERENCES public.academies(id) ON DELETE CASCADE;
CREATE INDEX idx_training_sessions_academy_id ON public.training_sessions(academy_id);

-- 7. Attendance
ALTER TABLE public.attendance ADD COLUMN academy_id UUID;
ALTER TABLE public.attendance
  ADD CONSTRAINT fk_attendance_academy_id
  FOREIGN KEY (academy_id) REFERENCES public.academies(id) ON DELETE CASCADE;
CREATE INDEX idx_attendance_academy_id ON public.attendance(academy_id);

-- 8. Fee Structure
ALTER TABLE public.fee_structure ADD COLUMN academy_id UUID;
ALTER TABLE public.fee_structure
  ADD CONSTRAINT fk_fee_structure_academy_id
  FOREIGN KEY (academy_id) REFERENCES public.academies(id) ON DELETE CASCADE;
CREATE INDEX idx_fee_structure_academy_id ON public.fee_structure(academy_id);

-- 9. Payments
ALTER TABLE public.payments ADD COLUMN academy_id UUID;
ALTER TABLE public.payments
  ADD CONSTRAINT fk_payments_academy_id
  FOREIGN KEY (academy_id) REFERENCES public.academies(id) ON DELETE CASCADE;
CREATE INDEX idx_payments_academy_id ON public.payments(academy_id);

-- 10. Payment Receipts
ALTER TABLE public.payment_receipts ADD COLUMN academy_id UUID;
ALTER TABLE public.payment_receipts
  ADD CONSTRAINT fk_payment_receipts_academy_id
  FOREIGN KEY (academy_id) REFERENCES public.academies(id) ON DELETE CASCADE;
CREATE INDEX idx_payment_receipts_academy_id ON public.payment_receipts(academy_id);

-- 11. Documents
ALTER TABLE public.documents ADD COLUMN academy_id UUID;
ALTER TABLE public.documents
  ADD CONSTRAINT fk_documents_academy_id
  FOREIGN KEY (academy_id) REFERENCES public.academies(id) ON DELETE CASCADE;
CREATE INDEX idx_documents_academy_id ON public.documents(academy_id);

-- 12. Document Access Log
ALTER TABLE public.document_access_log ADD COLUMN academy_id UUID;
ALTER TABLE public.document_access_log
  ADD CONSTRAINT fk_document_access_log_academy_id
  FOREIGN KEY (academy_id) REFERENCES public.academies(id) ON DELETE CASCADE;
CREATE INDEX idx_document_access_log_academy_id ON public.document_access_log(academy_id);

-- Note: After this migration, we will need to update all RLS policies
-- to use the academy_id for data isolation. That will be the next step.
