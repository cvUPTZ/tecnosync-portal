import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AboutPageContent {
  title: string;
  hero_image_url?: string;
  content: {
    introduction: string;
    mission?: string;
    vision?: string;
  };
}

interface AboutSectionProps {
  pageData: AboutPageContent;
}

const AboutSection: React.FC<AboutSectionProps> = ({ pageData }) => {
  if (!pageData) {
    return null;
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <Card className="overflow-hidden">
        {pageData.hero_image_url && (
          <img src={pageData.hero_image_url} alt={pageData.title} className="w-full h-64 object-cover" />
        )}
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center">{pageData.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-lg text-gray-700 space-y-6">
          <p className="whitespace-pre-wrap">{pageData.content.introduction}</p>
          {pageData.content.mission && (
            <div>
              <h3 className="text-2xl font-semibold mb-2">Our Mission</h3>
              <p className="whitespace-pre-wrap">{pageData.content.mission}</p>
            </div>
          )}
          {pageData.content.vision && (
            <div>
              <h3 className="text-2xl font-semibold mb-2">Our Vision</h3>
              <p className="whitespace-pre-wrap">{pageData.content.vision}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutSection;
