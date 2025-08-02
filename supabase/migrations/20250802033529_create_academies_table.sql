-- Migration to create the academies table for multi-tenancy
CREATE TABLE public.academies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Basic Academy Information
  name TEXT NOT NULL,
  subdomain TEXT NOT NULL UNIQUE,
  contact_email TEXT,

  -- Customization and Branding
  logo_url TEXT,
  primary_color VARCHAR(7), -- e.g., '#RRGGBG'
  secondary_color VARCHAR(7),

  -- Social Media Links
  social_links JSONB,

  -- Feature Flags / Modules
  -- Example: {"finance": true, "attendance": true, "reports": false}
  modules JSONB
);

-- Enable Row Level Security for the new table
ALTER TABLE public.academies ENABLE ROW LEVEL SECURITY;

-- Policies for academies table
-- For now, we'll allow admins of the platform to manage academies.
-- We will define a 'platform_admin' role later. For now, access is restricted.
CREATE POLICY "Platform admins can manage academies"
ON public.academies
FOR ALL
USING (
  -- This function will be created in a later migration.
  -- For now, no one can access this table directly from the API.
  -- public.is_platform_admin()
  false
);

-- Add a comment to the table for clarity
COMMENT ON TABLE public.academies IS 'Stores information about each football academy tenant in the system.';
COMMENT ON COLUMN public.academies.subdomain IS 'The unique subdomain for the academy, used for routing.';
COMMENT ON COLUMN public.academies.modules IS 'JSONB object to enable/disable features for the academy.';
