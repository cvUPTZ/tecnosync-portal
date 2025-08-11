// src/components/public/layout/SectionRenderer.tsx
import React from 'react';
import { withLayout } from './withLayout';
import type { SectionConfig, ThemeConfig, SectionKey } from '../site';

export type SectionMap = Record<SectionKey, (args?: any) => React.ReactNode>;

interface SectionRendererProps {
  sections: SectionConfig[];
  sectionMap: SectionMap;
  theme?: ThemeConfig;
}

const SectionRenderer: React.FC<SectionRendererProps> = ({ sections, sectionMap, theme }) => {
  return (
    <div className={[theme?.background, theme?.text].filter(Boolean).join(' ')}>
      {sections.map((section) => {
        const render = sectionMap[section.key];
        if (!render) return null;
        const node = render({ section });
        return (
          <React.Fragment key={`${section.key}-${section.id || ''}`}>
            {withLayout(node, { layout: section.layout, id: section.id })}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default SectionRenderer;
export type { SectionConfig };
