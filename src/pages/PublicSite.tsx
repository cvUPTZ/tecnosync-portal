import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import PublicLayout from '@/components/public/PublicLayout';
import AboutSection from '@/components/public/AboutSection';
import TeamSection from '@/components/public/TeamSection';

const PublicSite = () => {
  const { subdomain } = useParams<{ subdomain: string }>();
  const [academy, setAcademy] = useState<any>(null);
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
        // 1. Fetch academy details by subdomain
        const { data: academyData, error: academyError } = await supabase
          .from('academies')
          .select('id, name')
          .eq('subdomain', subdomain)
          .single();

        if (academyError || !academyData) {
          throw new Error('Academy not found.');
        }
        setAcademy(academyData);

        // 2. Fetch public content for this academy
        const academyId = academyData.id;

        const [pageResult, teamResult] = await Promise.all([
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

        if (pageResult.error) throw pageResult.error;
        if (teamResult.error) throw teamResult.error;

        setAboutPage(pageResult.data);
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
          <p>Loading academy site...</p>
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
    <PublicLayout>
      {/* Render sections based on fetched data */}
      {aboutPage && <AboutSection pageData={aboutPage} />}
      {teamMembers.length > 0 && <TeamSection teamMembers={teamMembers} />}

      {!aboutPage && teamMembers.length === 0 && (
         <div className="container mx-auto px-6 py-12 text-center">
            <h1 className="text-2xl font-bold">{academy?.name}</h1>
            <p>This academy has not configured its public website yet.</p>
        </div>
      )}
    </PublicLayout>
  );
};

export default PublicSite;
