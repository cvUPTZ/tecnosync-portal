-- Create the academies table
CREATE TABLE public.academies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subdomain TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  modules JSONB NOT NULL DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create website_settings table
CREATE TABLE public.website_settings (
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

-- Create team_members table
CREATE TABLE public.team_members (
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

-- Create public_pages table
CREATE TABLE public.public_pages (
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

-- Add foreign key constraints
ALTER TABLE public.website_settings 
ADD CONSTRAINT website_settings_academy_id_fkey 
FOREIGN KEY (academy_id) REFERENCES public.academies(id) ON DELETE CASCADE;

ALTER TABLE public.team_members 
ADD CONSTRAINT team_members_academy_id_fkey 
FOREIGN KEY (academy_id) REFERENCES public.academies(id) ON DELETE CASCADE;

ALTER TABLE public.public_pages 
ADD CONSTRAINT public_pages_academy_id_fkey 
FOREIGN KEY (academy_id) REFERENCES public.academies(id) ON DELETE CASCADE;

-- Add academy_id to profiles table
ALTER TABLE public.profiles 
ADD COLUMN academy_id UUID;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_academy_id_fkey 
FOREIGN KEY (academy_id) REFERENCES public.academies(id) ON DELETE SET NULL;

-- Enable Row Level Security
ALTER TABLE public.academies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_pages ENABLE ROW LEVEL SECURITY;

-- Create policies for academies
CREATE POLICY "Platform admins can manage all academies" 
ON public.academies 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'platform_admin'
  )
);

CREATE POLICY "Academy users can view their academy" 
ON public.academies 
FOR SELECT 
USING (
  id = (
    SELECT academy_id FROM public.profiles 
    WHERE profiles.user_id = auth.uid()
  )
);

-- Create policies for website_settings
CREATE POLICY "Users can view their academy website settings" 
ON public.website_settings 
FOR SELECT 
USING (
  academy_id = (
    SELECT academy_id FROM public.profiles 
    WHERE profiles.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'platform_admin'
  )
);

CREATE POLICY "Directors can update their academy website settings" 
ON public.website_settings 
FOR ALL 
USING (
  academy_id = (
    SELECT academy_id FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'director'
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'platform_admin'
  )
);

-- Create policies for team_members
CREATE POLICY "Anyone can view published team members" 
ON public.team_members 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Academy users can manage their team members" 
ON public.team_members 
FOR ALL 
USING (
  academy_id = (
    SELECT academy_id FROM public.profiles 
    WHERE profiles.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'platform_admin'
  )
);

-- Create policies for public_pages
CREATE POLICY "Anyone can view published pages" 
ON public.public_pages 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Academy users can manage their pages" 
ON public.public_pages 
FOR ALL 
USING (
  academy_id = (
    SELECT academy_id FROM public.profiles 
    WHERE profiles.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'platform_admin'
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_academies_updated_at
  BEFORE UPDATE ON public.academies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_website_settings_updated_at
  BEFORE UPDATE ON public.website_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_public_pages_updated_at
  BEFORE UPDATE ON public.public_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to create new academy with admin user
CREATE OR REPLACE FUNCTION public.create_new_academy(
  academy_name TEXT,
  academy_subdomain TEXT,
  admin_full_name TEXT,
  admin_email TEXT,
  admin_password TEXT,
  modules_config JSONB DEFAULT '{}'
)
RETURNS TABLE(id UUID, name TEXT, subdomain TEXT) AS $$
DECLARE
  new_academy_id UUID;
  new_user_id UUID;
  new_profile_id UUID;
BEGIN
  -- Create the academy
  INSERT INTO public.academies (name, subdomain, modules)
  VALUES (academy_name, academy_subdomain, modules_config)
  RETURNING academies.id INTO new_academy_id;

  -- Create the admin user in auth.users (this is a simplified version)
  -- In practice, you'd use Supabase auth APIs to create the user
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES (admin_email, crypt(admin_password, gen_salt('bf')), now(), now(), now())
  RETURNING id INTO new_user_id;

  -- Create the profile
  INSERT INTO public.profiles (user_id, email, full_name, role, academy_id, is_active)
  VALUES (new_user_id, admin_email, admin_full_name, 'director', new_academy_id, true)
  RETURNING id INTO new_profile_id;

  RETURN QUERY SELECT new_academy_id, academy_name, academy_subdomain;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add platform_admin role to enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE app_role AS ENUM ('director', 'comptabilite_chief', 'coach', 'parent', 'platform_admin');
  ELSE
    -- Add platform_admin if it doesn't exist in the enum
    BEGIN
      ALTER TYPE app_role ADD VALUE 'platform_admin';
    EXCEPTION WHEN duplicate_object THEN
      -- Value already exists, do nothing
    END;
  END IF;
END $$;