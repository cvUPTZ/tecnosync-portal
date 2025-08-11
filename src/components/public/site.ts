// src/components/public/site.ts
export type SectionKey =
  | 'hero'
  | 'about'
  | 'features'
  | 'programs'
  | 'team'
  | 'gallery'
  | 'contact';

export type LayoutType = 'full' | 'container' | 'centered';

export interface SectionConfig {
  key: SectionKey;
  layout?: LayoutType;
  id?: string; // for anchor navigation
}

export interface ThemeConfig {
  background?: string; // tailwind class e.g., 'bg-gray-50'
  text?: string; // tailwind class e.g., 'text-gray-900'
}

export interface SiteConfig {
  sections: SectionConfig[];
  theme: ThemeConfig;
  seo: {
    title: string;
    description?: string;
    canonical?: string;
  };
}

export const buildSiteConfig = (
  academy: any,
  content: any,
  canonical?: string
): SiteConfig => {
  const title = academy?.name ? `${academy.name} | Academy` : 'Academy';
  const description = content?.hero?.subtitle || 'Explore our programs and team.';

  return {
    sections: [
      { key: 'hero', layout: 'full', id: 'home' },
      { key: 'about', layout: 'container', id: 'about' },
      { key: 'features', layout: 'container', id: 'features' },
      { key: 'programs', layout: 'container', id: 'programs' },
      { key: 'team', layout: 'container', id: 'team' },
      { key: 'gallery', layout: 'container', id: 'gallery' },
      { key: 'contact', layout: 'centered', id: 'contact' },
    ],
    theme: {
      background: 'bg-gray-50',
      text: 'text-gray-900',
    },
    seo: {
      title,
      description,
      canonical,
    },
  };
};
