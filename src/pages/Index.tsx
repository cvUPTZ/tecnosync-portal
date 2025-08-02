import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Layout, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import PlatformHeader from '@/components/public/PlatformHeader';
import PlatformFooter from '@/components/public/PlatformFooter';

const Index = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Layout className="w-8 h-8 text-tfa-blue" />,
      title: t('landingPage.feature1Title'),
      text: t('landingPage.feature1Text'),
    },
    {
      icon: <CheckCircle2 className="w-8 h-8 text-tfa-blue" />,
      title: t('landingPage.feature2Title'),
      text: t('landingPage.feature2Text'),
    },
    {
      icon: <SlidersHorizontal className="w-8 h-8 text-tfa-blue" />,
      title: t('landingPage.feature3Title'),
      text: t('landingPage.feature3Text'),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <PlatformHeader />
      <main className="flex-grow">
        {/* Hero Section */}
        <section id="hero" className="bg-white dark:bg-gray-900">
          <div className="container mx-auto px-6 py-16 text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white md:text-5xl lg:text-6xl">
                {t('landingPage.heroTitle')}
              </h1>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
                {t('landingPage.heroSubtitle')}
              </p>
              <Link to="/login">
                <Button size="lg" className="mt-8 bg-tfa-blue hover:bg-tfa-blue/90">
                  {t('landingPage.getStarted')}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-6 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                {t('landingPage.featuresTitle')}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Card key={index}>
                  <CardHeader className="items-center">
                    <div className="p-3 bg-tfa-blue/10 rounded-full">
                      {feature.icon}
                    </div>
                  </CardHeader>
                  <CardContent className="text-center">
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{feature.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <PlatformFooter />
    </div>
  );
};

export default Index;