
// hooks/useAcademySetup.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AcademySetupStatus {
  hasLogo: boolean;
  hasTeamMembers: boolean;
  hasCustomContent: boolean;
  hasContactInfo: boolean;
  hasStudents: boolean;
  hasRegistrationForms: boolean;
  isLoading: boolean;
}

export const useAcademySetup = (academyId: string) => {
  const [setupStatus, setSetupStatus] = useState<AcademySetupStatus>({
    hasLogo: false,
    hasTeamMembers: false,
    hasCustomContent: false,
    hasContactInfo: false,
    hasStudents: false,
    hasRegistrationForms: false,
    isLoading: true,
  });

  useEffect(() => {
    const checkSetupStatus = async () => {
      if (!academyId) return;

      try {
        // Check for logo in website_settings
        const { data: websiteSettings } = await supabase
          .from('website_settings')
          .select('logo_url')
          .eq('academy_id', academyId)
          .single();

        // Check for team members
        const { data: teamMembers } = await supabase
          .from('team_members')
          .select('id')
          .eq('academy_id', academyId)
          .limit(1);

        // Check for custom content (non-default homepage)
        const { data: customContent } = await supabase
          .from('public_pages')
          .select('id')
          .eq('academy_id', academyId)
          .neq('slug', 'homepage')
          .limit(1);

        // Check contact info completeness in website_settings
        const { data: contactInfo } = await supabase
          .from('website_settings')
          .select('contact_email, contact_phone, address')
          .eq('academy_id', academyId)
          .single();

        // Check for students (if students table exists)
        const { data: students } = await supabase
          .from('students')
          .select('id')
          .eq('academy_id', academyId)
          .limit(1);

        setSetupStatus({
          hasLogo: !!(websiteSettings?.logo_url),
          hasTeamMembers: !!(teamMembers && teamMembers.length > 0),
          hasCustomContent: !!(customContent && customContent.length > 0),
          hasContactInfo: !!(contactInfo?.contact_email && contactInfo?.contact_phone && contactInfo?.address),
          hasStudents: !!(students && students.length > 0),
          hasRegistrationForms: false, // This would need to be implemented based on your registration system
          isLoading: false,
        });
      } catch (error) {
        console.error('Error checking setup status:', error);
        setSetupStatus(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkSetupStatus();
  }, [academyId]);

  return setupStatus;
};

export { AcademySetupChecklist, WebsitePreview };
