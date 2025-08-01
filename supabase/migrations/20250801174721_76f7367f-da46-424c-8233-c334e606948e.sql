-- Create registration applications table
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Personal Information
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  nationality TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  
  -- Parent Information
  parent_name TEXT,
  parent_phone TEXT,
  parent_email TEXT,
  parent_id_number TEXT,
  parent_profession TEXT,
  
  -- Technical Information
  position TEXT,
  previous_experience TEXT,
  medical_conditions TEXT,
  preferred_foot TEXT,
  program_preference TEXT,
  
  -- Emergency Information
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  
  -- Other Information
  how_did_you_hear TEXT,
  additional_notes TEXT,
  
  -- Status and metadata
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'waiting_list')),
  application_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (public registration)
CREATE POLICY "Anyone can submit registration" 
ON public.registrations 
FOR INSERT 
WITH CHECK (true);

-- Create policy for admins to view all registrations (we'll set up roles later)
CREATE POLICY "Admins can view all registrations" 
ON public.registrations 
FOR SELECT 
USING (true);

-- Create policy for admins to update registrations
CREATE POLICY "Admins can update registrations" 
ON public.registrations 
FOR UPDATE 
USING (true);

-- Create index for faster queries
CREATE INDEX idx_registrations_status ON public.registrations(status);
CREATE INDEX idx_registrations_date ON public.registrations(application_date);
CREATE INDEX idx_registrations_email ON public.registrations(email);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();