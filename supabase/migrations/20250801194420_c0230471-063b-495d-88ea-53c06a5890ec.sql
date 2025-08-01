-- Create storage buckets for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('student-documents', 'student-documents', false);

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'policies', 'forms', 'reports', 'certificates', 'student_docs', 'financial', 'legal', 'training')),
  visibility VARCHAR(20) NOT NULL DEFAULT 'internal' CHECK (visibility IN ('public', 'internal', 'restricted', 'private')),
  tags TEXT[],
  uploaded_by UUID REFERENCES auth.users(id),
  student_id UUID REFERENCES public.students(id), -- For student-specific documents
  group_id UUID REFERENCES public.student_groups(id), -- For group-specific documents
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create document access log table
CREATE TABLE public.document_access_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(20) NOT NULL CHECK (action IN ('view', 'download', 'upload', 'update', 'delete')),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access_log ENABLE ROW LEVEL SECURITY;

-- Create policies for documents
CREATE POLICY "Admins can manage all documents" 
ON public.documents 
FOR ALL 
USING (get_current_user_role() IN ('director', 'comptabilite_chief'));

CREATE POLICY "Coaches can view and upload documents" 
ON public.documents 
FOR SELECT 
USING (
  get_current_user_role() = 'coach' 
  AND visibility IN ('public', 'internal')
);

CREATE POLICY "Coaches can upload documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (
  get_current_user_role() = 'coach' 
  AND visibility IN ('public', 'internal')
);

CREATE POLICY "Parents can view their children's documents" 
ON public.documents 
FOR SELECT 
USING (
  get_current_user_role() = 'parent' 
  AND (
    visibility = 'public' 
    OR (
      student_id IN (
        SELECT id FROM public.students WHERE user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Users can view public documents" 
ON public.documents 
FOR SELECT 
USING (visibility = 'public');

-- Create policies for document access log
CREATE POLICY "Admins can view all access logs" 
ON public.document_access_log 
FOR SELECT 
USING (get_current_user_role() IN ('director', 'comptabilite_chief'));

CREATE POLICY "Users can create their own access logs" 
ON public.document_access_log 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Create storage policies for documents bucket
CREATE POLICY "Authenticated users can view documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Admins and coaches can upload documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Admins and coaches can update documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Admins can delete documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

-- Create storage policies for student-documents bucket
CREATE POLICY "Authenticated users can view student documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'student-documents' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Staff can upload student documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'student-documents' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Staff can update student documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'student-documents' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Admins can delete student documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'student-documents' 
  AND auth.role() = 'authenticated'
);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_documents_category ON public.documents(category);
CREATE INDEX idx_documents_visibility ON public.documents(visibility);
CREATE INDEX idx_documents_student_id ON public.documents(student_id);
CREATE INDEX idx_documents_group_id ON public.documents(group_id);
CREATE INDEX idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX idx_documents_tags ON public.documents USING GIN(tags);
CREATE INDEX idx_document_access_log_document_id ON public.document_access_log(document_id);
CREATE INDEX idx_document_access_log_user_id ON public.document_access_log(user_id);

-- Function to log document access
CREATE OR REPLACE FUNCTION public.log_document_access(
  p_document_id UUID,
  p_action TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
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
END;
$$;