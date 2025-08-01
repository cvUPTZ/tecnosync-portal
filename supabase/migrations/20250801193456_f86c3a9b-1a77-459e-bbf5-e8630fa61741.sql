-- Create payments table for tracking student payments
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_type VARCHAR(50) NOT NULL DEFAULT 'monthly_fee' CHECK (payment_type IN ('monthly_fee', 'registration_fee', 'equipment', 'tournament', 'other')),
  payment_method VARCHAR(30) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'bank_transfer', 'online', 'check')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  due_date DATE NOT NULL,
  paid_date DATE,
  payment_reference VARCHAR(100),
  notes TEXT,
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fee structure table
CREATE TABLE public.fee_structure (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.student_groups(id) ON DELETE CASCADE,
  fee_type VARCHAR(50) NOT NULL DEFAULT 'monthly_fee' CHECK (fee_type IN ('monthly_fee', 'registration_fee', 'equipment', 'tournament', 'other')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment receipts table
CREATE TABLE public.payment_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  receipt_number VARCHAR(50) NOT NULL UNIQUE,
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  issued_by UUID REFERENCES auth.users(id),
  receipt_data JSONB, -- Store receipt details as JSON
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;

-- Create policies for payments
CREATE POLICY "Finance staff can manage all payments" 
ON public.payments 
FOR ALL 
USING (get_current_user_role() IN ('director', 'comptabilite_chief'));

CREATE POLICY "Parents can view their children's payments" 
ON public.payments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.students s 
    WHERE s.id = payments.student_id 
    AND s.user_id = auth.uid()
  )
);

-- Create policies for fee structure
CREATE POLICY "Finance staff can manage fee structure" 
ON public.fee_structure 
FOR ALL 
USING (get_current_user_role() IN ('director', 'comptabilite_chief'));

CREATE POLICY "All users can view fee structure" 
ON public.fee_structure 
FOR SELECT 
USING (true);

-- Create policies for payment receipts
CREATE POLICY "Finance staff can manage receipts" 
ON public.payment_receipts 
FOR ALL 
USING (get_current_user_role() IN ('director', 'comptabilite_chief'));

CREATE POLICY "Parents can view their children's receipts" 
ON public.payment_receipts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.payments p
    JOIN public.students s ON s.id = p.student_id
    WHERE p.id = payment_receipts.payment_id 
    AND s.user_id = auth.uid()
  )
);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fee_structure_updated_at
BEFORE UPDATE ON public.fee_structure
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_payments_student_id ON public.payments(student_id);
CREATE INDEX idx_payments_due_date ON public.payments(due_date);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_payment_type ON public.payments(payment_type);
CREATE INDEX idx_fee_structure_group_id ON public.fee_structure(group_id);

-- Function to generate receipt number
CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_number TEXT;
  year_suffix TEXT;
  counter INTEGER;
BEGIN
  -- Get current year suffix (e.g., 24 for 2024)
  year_suffix := EXTRACT(year FROM CURRENT_DATE)::TEXT;
  year_suffix := RIGHT(year_suffix, 2);
  
  -- Get the count of receipts this year + 1
  SELECT COUNT(*) + 1 INTO counter
  FROM payment_receipts 
  WHERE receipt_number LIKE 'TFA' || year_suffix || '%';
  
  -- Format: TFA + YY + 6-digit number (e.g., TFA24000001)
  new_number := 'TFA' || year_suffix || LPAD(counter::TEXT, 6, '0');
  
  -- Check if number already exists (safety check)
  WHILE EXISTS(SELECT 1 FROM payment_receipts WHERE receipt_number = new_number) LOOP
    counter := counter + 1;
    new_number := 'TFA' || year_suffix || LPAD(counter::TEXT, 6, '0');
  END LOOP;
  
  RETURN new_number;
END;
$$;

-- Insert some default fee structures
INSERT INTO public.fee_structure (group_id, fee_type, amount, description) 
SELECT 
  sg.id,
  'monthly_fee',
  CASE 
    WHEN sg.max_age <= 8 THEN 3000.00
    WHEN sg.max_age <= 12 THEN 3500.00
    WHEN sg.max_age <= 16 THEN 4000.00
    ELSE 4500.00
  END,
  'الرسوم الشهرية لمجموعة ' || sg.name
FROM public.student_groups sg 
WHERE sg.is_active = true;

INSERT INTO public.fee_structure (group_id, fee_type, amount, description) 
SELECT 
  sg.id,
  'registration_fee',
  1500.00,
  'رسوم التسجيل لمجموعة ' || sg.name
FROM public.student_groups sg 
WHERE sg.is_active = true;