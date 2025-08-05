-- Add academy_id to registrations table to associate registrations with academies
ALTER TABLE registrations ADD COLUMN academy_id uuid REFERENCES academies(id);

-- Set academy_id for existing registrations (set to the first academy for now)
UPDATE registrations 
SET academy_id = (SELECT id FROM academies LIMIT 1)
WHERE academy_id IS NULL;

-- Make academy_id NOT NULL after setting values
ALTER TABLE registrations ALTER COLUMN academy_id SET NOT NULL;

-- Add RLS policy for academy-specific access
DROP POLICY IF EXISTS "Anyone can submit registration" ON registrations;
DROP POLICY IF EXISTS "Admins can manage all registrations" ON registrations;
DROP POLICY IF EXISTS "Admins can update registrations" ON registrations;
DROP POLICY IF EXISTS "Admins can view all registrations" ON registrations;
DROP POLICY IF EXISTS "Coaches can view registrations" ON registrations;

-- Create new RLS policies that respect academy boundaries
CREATE POLICY "Users can submit registrations to any academy" 
ON registrations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Academy users can view their academy registrations" 
ON registrations 
FOR SELECT 
USING (
  academy_id = (
    SELECT profiles.academy_id 
    FROM profiles 
    WHERE profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Academy admins can update their academy registrations" 
ON registrations 
FOR UPDATE 
USING (
  academy_id = (
    SELECT profiles.academy_id 
    FROM profiles 
    WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('director', 'comptabilite_chief')
  )
);

CREATE POLICY "Academy admins can manage their academy registrations" 
ON registrations 
FOR ALL 
USING (
  academy_id = (
    SELECT profiles.academy_id 
    FROM profiles 
    WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('director', 'comptabilite_chief')
  )
);