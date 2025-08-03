import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import PublicLayout from '@/components/public/PublicLayout';
import AboutSection from '@/components/public/AboutSection';
import TeamSection from '@/components/public/TeamSection';

// A new Hero component for the academy's specific hero section
const AcademyHero = ({ pageData }: { pageData: any }) => {
  if (!pageData) return null;
  return (
    <div className="bg-gray-800 text-white">
      <div className="container mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl font-bold">{pageData.title}</h1>
        {pageData.content?.subtitle && <p className="text-xl mt-4">{pageData.content.subtitle}</p>}
      </div>
    </div>
  );
};

const AcademyHomepage = () => {
  const { subdomain } = useParams<{ subdomain: string }>();
  const [academyData, setAcademyData] = useState<any>(null);
  const [websiteSettings, setWebsiteSettings] = useState<any>(null);
  const [homePage, setHomePage] = useState<any>(null);
  const [aboutPage, setAboutPage] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!subdomain) {
      setError('No subdomain provided.');
      setLoading(false);
      return;
    }

    const fetchSiteData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch academy ID by subdomain
        const { data: academyData, error: academyError } = await supabase
          .from('academies')
          .select('id, name')
          .eq('subdomain', subdomain)
          .single();

        if (academyError || !academyData) {
          throw new Error('Academy not found.');
        }

        const academyId = academyData.id;
        setAcademyData(academyData);

        // 2. Fetch website settings and public content for this academy
        const [settingsResult, homeResult, aboutResult, teamResult] = await Promise.all([
          supabase
            .from('website_settings')
            .select('*')
            .eq('academy_id', academyId)
            .maybeSingle(),
          supabase
            .from('public_pages')
            .select('*')
            .eq('academy_id', academyId)
            .eq('slug', 'homepage') // Fetch the new homepage content
            .maybeSingle(),
          supabase
            .from('public_pages')
            .select('*')
            .eq('academy_id', academyId)
            .eq('slug', 'about-us')
            .maybeSingle(),
          supabase
            .from('team_members')
            .select('*')
            .eq('academy_id', academyId)
            .order('display_order'),
        ]);

        if (settingsResult.error) throw settingsResult.error;
        if (homeResult.error) throw homeResult.error;
        if (aboutResult.error) throw aboutResult.error;
        if (teamResult.error) throw teamResult.error;

        setWebsiteSettings(settingsResult.data);
        setHomePage(homeResult.data);
        setAboutPage(aboutResult.data);
        setTeamMembers(teamResult.data || []);

      } catch (err: any) {
        setError(err.message || 'Failed to load website data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteData();
  }, [subdomain]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-6 py-12 text-center">
          <p>Loading Academy Homepage...</p>
        </div>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p>{error}</p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout 
      academyName={academyData?.name}
      primaryColor={websiteSettings?.primary_color}
    >
      <AcademyHero pageData={homePage} />
      {aboutPage && (
        <AboutSection 
          title="About Us"
          content={(aboutPage?.content as any)?.introduction || 'Welcome to our academy'}
        />
      )}
      {teamMembers && teamMembers.length > 0 && (
        <TeamSection 
          title="Our Team"
          members={teamMembers?.map(member => ({
            id: member.id,
            name: member.name,
            position: member.position,
            bio: member.bio,
            image_url: member.image_url
          })) || []}
        />
      )}
    </PublicLayout>
  );
};

export default AcademyHomepage;
