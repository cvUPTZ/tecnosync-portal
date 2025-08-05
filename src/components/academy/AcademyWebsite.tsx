// src/components/academy/AcademyWebsite.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AcademyWebsite = () => {
  const { subdomain } = useParams();
  const [academy, setAcademy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAcademy = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('academies')
          .select('id, name, contact_phone, contact_email')
          .eq('subdomain', subdomain)
          .single();

        if (error) throw error;
        if (!data) throw new Error('الأكاديمية غير موجودة');

        setAcademy(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (subdomain) {
      fetchAcademy();
    }
  }, [subdomain]);

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
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-900">{academy.name}</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-blue-600">الرئيسية</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600">من نحن</a>
              <a href="#programs" className="text-gray-700 hover:text-blue-600">البرامج</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600">اتصل بنا</a>
            </nav>
            <Button asChild>
              <a href={`/site/${subdomain}/register`}>التسجيل</a>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-blue-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {academy.name}
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              أكاديمية رائدة في تطوير مواهب كرة القدم للشباب
            </p>
            <Button size="lg" variant="secondary" asChild>
              <a href={`/site/${subdomain}/register`}>سجل الآن</a>
            </Button>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">من نحن</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img 
                  src="https://images.unsplash.com/photo-1546519638-68e109acd85d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Football Training" 
                  className="rounded-lg shadow-lg"
                />
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-4">تطوير المواهب منذ 2010</h3>
                <p className="text-gray-600 mb-4">
                  نحن نؤمن بأن كل طفل لديه إمكانات لا حدود لها. مهمتنا هي اكتشاف وتطوير مواهب كرة القدم من خلال برامج تدريب مبتكرة ورعاية شاملة.
                </p>
                <p className="text-gray-600">
                  فريقنا من المدربين المعتمدين يلتزم بمساعدة اللاعبين على تحقيق أقصى إمكاناتهم الفنية والبدنية والذهنية.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Programs Section */}
        <section id="programs" className="bg-gray-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">برامجنا</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { age: "5-8 سنوات", level: "مبتدئ", description: "تعلم المهارات الأساسية في بيئة ممتعة وآمنة" },
                { age: "9-12 سنة", level: "متوسط", description: "تطوير المهارات المتقدمة والعمل الجماعي" },
                { age: "13-16 سنة", level: "متقدم", description: "تحضير اللاعبين للمنافسة على مستوى عالٍ" }
              ].map((program, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{program.age}</CardTitle>
                    <CardDescription>{program.level}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{program.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Registration CTA */}
        <section className="bg-blue-600 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">ابدأ رحلتك معنا</h2>
            <p className="text-xl mb-8">
              سجل طفلك اليوم وابدأ رحلة تطوير مواهبه في كرة القدم
            </p>
            <Button size="lg" variant="secondary" asChild>
              <a href={`/site/${subdomain}/register`}>التسجيل الآن</a>
            </Button>
          </div>
        </section>
      </main>

      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">{academy.name}</h3>
              <p className="text-gray-400">
                أكاديمية رائدة في تطوير مواهب كرة القدم
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">روابط سريعة</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">الرئيسية</a></li>
                <li><a href="#about" className="hover:text-white">من نحن</a></li>
                <li><a href="#programs" className="hover:text-white">البرامج</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">اتصل بنا</h3>
              <div className="space-y-2 text-gray-400">
                <p>{academy.contact_phone}</p>
                <p>{academy.contact_email}</p>
                <p>الجزائر، الجزائر</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">ساعات العمل</h3>
              <div className="text-gray-400">
                <p>السبت - الخميس</p>
                <p>8:00 - 18:00</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} {academy.name}. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AcademyWebsite;
