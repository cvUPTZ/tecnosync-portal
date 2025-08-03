-- Create policies for academies table
DO $$
BEGIN
  -- Check if policies exist before creating them
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'academies' AND policyname = 'Platform admins can manage all academies') THEN
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
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'academies' AND policyname = 'Academy users can view their academy') THEN
    CREATE POLICY "Academy users can view their academy" 
    ON public.academies 
    FOR SELECT 
    USING (
      id = (
        SELECT academy_id FROM public.profiles 
        WHERE profiles.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Create policies for website_settings table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'website_settings' AND policyname = 'Users can view their academy website settings') THEN
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
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'website_settings' AND policyname = 'Directors can update their academy website settings') THEN
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
  END IF;
END $$;

-- Create policies for team_members table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'Anyone can view published team members') THEN
    CREATE POLICY "Anyone can view published team members" 
    ON public.team_members 
    FOR SELECT 
    USING (is_published = true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'Academy users can manage their team members') THEN
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
  END IF;
END $$;

-- Create policies for public_pages table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'public_pages' AND policyname = 'Anyone can view published pages') THEN
    CREATE POLICY "Anyone can view published pages" 
    ON public.public_pages 
    FOR SELECT 
    USING (is_published = true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'public_pages' AND policyname = 'Academy users can manage their pages') THEN
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
  END IF;
END $$;

-- Create triggers for automatic timestamp updates if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_academies_updated_at') THEN
    CREATE TRIGGER update_academies_updated_at
      BEFORE UPDATE ON public.academies
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_website_settings_updated_at') THEN
    CREATE TRIGGER update_website_settings_updated_at
      BEFORE UPDATE ON public.website_settings
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_team_members_updated_at') THEN
    CREATE TRIGGER update_team_members_updated_at
      BEFORE UPDATE ON public.team_members
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_public_pages_updated_at') THEN
    CREATE TRIGGER update_public_pages_updated_at
      BEFORE UPDATE ON public.public_pages
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;