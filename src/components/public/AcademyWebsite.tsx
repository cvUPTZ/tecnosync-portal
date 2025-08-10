// src/components/public/AcademyWebsite.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import HeroSection from './HeroSection';
import AboutSection from './AboutSection';
import FeaturesSection from './FeaturesSection';
import TeamSection from './TeamSection';
import ProgramsSection from './ProgramsSection';
import GallerySection from './GallerySection';
import ContactSection from './ContactSection';
import PublicHeader from './PlatformHeader';
import PublicFooter from './PlatformFooter';

const AcademyWebsite = ({ section }: { section?: string }) => {
  const { subdomain } = useParams();
  const navigate = useNavigate();
  const [academy, setAcademy] = useState<any>(null);
  const [content, setContent] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!subdomain) throw new Error('نطاق غير صالح');

        // Fetch academy
        const { data: academyData, error: academyError } = await supabase
          .from('academies')
          .select('id, name, contact_phone, contact_email')
          .eq('subdomain', subdomain)
          .single();

        if (academyError) throw academyError;
        if (!academyData) throw new Error('الأكاديمية غير موجودة');

        setAcademy(academyData);

        // Fetch website content
        const { data: contentData, error: contentError } = await supabase
          .from('public_pages')
          .select('content')
          .eq('academy_id', academyData.id)
          .eq('slug', 'homepage')
          .single();

        if (contentError && contentError.code !== 'PGRST116') { // PGRST116 means no rows found
          throw contentError;
        }

        setContent(contentData?.content || getDefaultContent());

        // Fetch team members
        const { data: teamData, error: teamError } = await supabase
          .from('team_members')
          .select('*')
          .eq('academy_id', academyData.id)
          .order('display_order');

        if (teamError) throw teamError;
        setTeamMembers(teamData || []);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subdomain]);

  const getDefaultContent = () => ({
    hero: {
      title: 'مرحباً بك في أكاديميتنا',
      subtitle: 'التميز في التدريب الرياضي',
      description: 'انضم إلينا للحصول على تدريب عالمي المستوى والتطوير',
      background_image: '',
      cta_text: 'ابدأ الآن',
      cta_link: '#contact'
    },
    about: {
      introduction: 'مرحباً بك في أكاديميتنا...',
      mission: 'مهمتنا هي...',
      vision: 'رؤيتنا هي...',
      values: ['التميز', 'النزاهة', 'العمل الجماعي']
    },
    features: {
      title: 'لماذا تختارنا',
      features: [
        { title: 'تدريب عالمي المستوى', description: 'مدربون معتمدون وخبرات دولية' },
        { title: 'برامج متكاملة', description: 'من البراعم إلى الناشئين' },
        { title: 'مرافق متطورة', description: 'ملعب عشبي طبيعي ومعدات حديثة' }
      ]
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-blue-600 mx-auto mb-4"></div>
          <p>جاري تحميل الموقع...</p>
        </div>
      </div>
    );
  }

  if (error || !academy) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>خطأ</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || 'الأكاديمية غير موجودة'}</p>
            <Button className="mt-4" asChild>
              <a href="/">العودة إلى الصفحة الرئيسية</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader academy={academy} />

      <main>
        {!section || section === 'home' ? (
          <>
            <HeroSection content={content?.hero} />
            <AboutSection content={content?.about} />
            <FeaturesSection content={content?.features} />
            <ProgramsSection />
            <TeamSection teamMembers={teamMembers} />
            <GallerySection />
            <ContactSection academy={academy} />
          </>
        ) : section === 'about' ? (
          <AboutSection content={content?.about} />
        ) : section === 'team' ? (
          <TeamSection teamMembers={teamMembers} />
        ) : section === 'programs' ? (
          <ProgramsSection />
        ) : section === 'contact' ? (
          <ContactSection academy={academy} />
        ) : section === 'gallery' ? (
          <GallerySection />
        ) : null}
      </main>

      <PublicFooter academy={academy} />
    </div>
  );
};

export default AcademyWebsite;
