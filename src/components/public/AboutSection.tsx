import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AboutContent {
  introduction: string;
  mission?: string;
  vision?: string;
  values?: string[];
  hero_image_url?: string;
}

interface AboutSectionProps {
  content: AboutContent;
}

const AboutSection: React.FC<AboutSectionProps> = ({ content }) => {
  if (!content) {
    return null;
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <Card className="overflow-hidden">
        {content.hero_image_url && (
          <img src={content.hero_image_url} alt="About Us" className="w-full h-64 object-cover" />
        )}
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center">About Our Academy</CardTitle>
        </CardHeader>
        <CardContent className="text-lg text-gray-700 space-y-6">
          <p className="whitespace-pre-wrap">{content.introduction}</p>
          {content.mission && (
            <div>
              <h3 className="text-2xl font-semibold mb-2">Our Mission</h3>
              <p className="whitespace-pre-wrap">{content.mission}</p>
            </div>
          )}
          {content.vision && (
            <div>
              <h3 className="text-2xl font-semibold mb-2">Our Vision</h3>
              <p className="whitespace-pre-wrap">{content.vision}</p>
            </div>
          )}
          {content.values && content.values.length > 0 && (
            <div>
              <h3 className="text-2xl font-semibold mb-2">Our Values</h3>
              <ul className="list-disc list-inside space-y-2">
                {content.values.map((value, index) => (
                  <li key={index}>{value}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutSection;
