-- Migration to create tables for public-facing website content

-- 1. Table for team members (coaches, staff, etc.)
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  full_name TEXT NOT NULL,
  position TEXT,
  bio TEXT,
  photo_url TEXT,
  display_order INT DEFAULT 0
);

-- Indexes
CREATE INDEX idx_team_members_academy_id ON public.team_members(academy_id);

-- RLS Policies for team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view team members" ON public.team_members
  FOR SELECT USING (true);

CREATE POLICY "Academy admins can manage their team members" ON public.team_members
  FOR ALL
  USING (academy_id = get_academy_id_from_user(auth.uid()))
  WITH CHECK (academy_id = get_academy_id_from_user(auth.uid()));


-- 2. Table for generic public pages (About Us, etc.)
CREATE TABLE public.public_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  slug TEXT NOT NULL, -- e.g., 'about-us', 'our-mission'
  title TEXT NOT NULL,
  content JSONB, -- Flexible content using JSON
  hero_image_url TEXT
);

-- Unique constraint for slug per academy
ALTER TABLE public.public_pages
  ADD CONSTRAINT unique_slug_per_academy
  UNIQUE (academy_id, slug);

-- Indexes
CREATE INDEX idx_public_pages_academy_id ON public.public_pages(academy_id);
CREATE INDEX idx_public_pages_academy_id_slug ON public.public_pages(academy_id, slug);

-- RLS Policies for public_pages
ALTER TABLE public.public_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view public pages" ON public.public_pages
  FOR SELECT USING (true);

CREATE POLICY "Academy admins can manage their public pages" ON public.public_pages
  FOR ALL
  USING (academy_id = get_academy_id_from_user(auth.uid()))
  WITH CHECK (academy_id = get_academy_id_from_user(auth.uid()));

-- Trigger to update 'updated_at' timestamp on changes
CREATE TRIGGER handle_updated_at_team_members
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER handle_updated_at_public_pages
  BEFORE UPDATE ON public.public_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
