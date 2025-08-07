import React from 'react';

interface Feature {
  title: string;
  description: string;
}

interface FeaturesContent {
  title: string;
  features: Feature[];
}

interface FeaturesSectionProps {
  content: FeaturesContent;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ content }) => {
  if (!content) {
    return null;
  }

  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-8">{content.title}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {content.features.map((feature, index) => (
            <div key={index} className="bg-gray-100 p-6 rounded-lg text-center">
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
