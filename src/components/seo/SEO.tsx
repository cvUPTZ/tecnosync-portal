import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  lang?: string;
  organization?: {
    name: string;
    url?: string;
    telephone?: string | null;
    email?: string | null;
    logo?: string | null;
  };
}

const SEO: React.FC<SEOProps> = ({ title, description, canonical, lang = 'en', organization }) => {
  const orgJsonLd = organization
    ? {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: organization.name,
        url: canonical,
        email: organization.email || undefined,
        telephone: organization.telephone || undefined,
        logo: organization.logo || undefined,
      }
    : null;

  return (
    <Helmet>
      <html lang={lang} />
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {orgJsonLd && (
        <script type="application/ld+json">{JSON.stringify(orgJsonLd)}</script>
      )}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Helmet>
  );
};

export default SEO;
