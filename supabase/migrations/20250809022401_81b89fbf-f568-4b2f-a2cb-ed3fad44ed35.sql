-- Fix remaining functions that need search_path

CREATE OR REPLACE FUNCTION public.generate_student_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.generate_receipt_number()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;