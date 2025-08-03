-- Add missing columns to academies table if they don't exist
DO $$ 
BEGIN
  -- Add logo_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'academies' AND column_name = 'logo_url') THEN
    ALTER TABLE public.academies ADD COLUMN logo_url TEXT;
  END IF;
  
  -- Add contact_email column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'academies' AND column_name = 'contact_email') THEN
    ALTER TABLE public.academies ADD COLUMN contact_email TEXT;
  END IF;
  
  -- Add contact_phone column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'academies' AND column_name = 'contact_phone') THEN
    ALTER TABLE public.academies ADD COLUMN contact_phone TEXT;
  END IF;
  
  -- Add address column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'academies' AND column_name = 'address') THEN
    ALTER TABLE public.academies ADD COLUMN address TEXT;
  END IF;
  
  -- Add is_active column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'academies' AND column_name = 'is_active') THEN
    ALTER TABLE public.academies ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
  END IF;
  
  -- Add modules column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'academies' AND column_name = 'modules') THEN
    ALTER TABLE public.academies ADD COLUMN modules JSONB NOT NULL DEFAULT '{}';
  END IF;
  
  -- Add settings column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'academies' AND column_name = 'settings') THEN
    ALTER TABLE public.academies ADD COLUMN settings JSONB DEFAULT '{}';
  END IF;
END $$;

-- Create website_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.website_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL,
  template TEXT NOT NULL DEFAULT 'classic',
  primary_color TEXT NOT NULL DEFAULT '#1e40af',
  logo_url TEXT,
  favicon_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  social_media JSONB DEFAULT '{}',
  seo_settings JSONB DEFAULT '{}',
  custom_css TEXT,
  analytics_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create public_pages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.public_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  meta_description TEXT,
  meta_keywords TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(academy_id, slug)
);

-- Add academy_id to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'academy_id') THEN
    ALTER TABLE public.profiles ADD COLUMN academy_id UUID;
  END IF;
END $$;

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
  -- Add foreign key for website_settings if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'website_settings_academy_id_fkey') THEN
    ALTER TABLE public.website_settings 
    ADD CONSTRAINT website_settings_academy_id_fkey 
    FOREIGN KEY (academy_id) REFERENCES public.academies(id) ON DELETE CASCADE;
  END IF;
  
  -- Add foreign key for team_members if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'team_members_academy_id_fkey') THEN
    ALTER TABLE public.team_members 
    ADD CONSTRAINT team_members_academy_id_fkey 
    FOREIGN KEY (academy_id) REFERENCES public.academies(id) ON DELETE CASCADE;
  END IF;
  
  -- Add foreign key for public_pages if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'public_pages_academy_id_fkey') THEN
    ALTER TABLE public.public_pages 
    ADD CONSTRAINT public_pages_academy_id_fkey 
    FOREIGN KEY (academy_id) REFERENCES public.academies(id) ON DELETE CASCADE;
  END IF;
  
  -- Add foreign key for profiles if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_academy_id_fkey') THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_academy_id_fkey 
    FOREIGN KEY (academy_id) REFERENCES public.academies(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable Row Level Security if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'academies' AND rowsecurity = true) THEN
    ALTER TABLE public.academies ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'website_settings' AND rowsecurity = true) THEN
    ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'team_members' AND rowsecurity = true) THEN
    ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'public_pages' AND rowsecurity = true) THEN
    ALTER TABLE public.public_pages ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Add platform_admin role to enum if it doesn't exist
DO $$ 
BEGIN
  BEGIN
    ALTER TYPE app_role ADD VALUE 'platform_admin';
  EXCEPTION WHEN duplicate_object THEN
    -- Value already exists, do nothing
  END;
END $$;