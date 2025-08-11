// src/components/public/layout/withLayout.tsx
import React from 'react';
import type { LayoutType } from '../site';

interface WithLayoutOptions {
  layout?: LayoutType;
  id?: string;
  className?: string;
}

export const withLayout = (
  element: React.ReactNode,
  { layout = 'container', id, className }: WithLayoutOptions = {}
) => {
  const base = 'py-12';
  const container = layout === 'full' ? '' : 'container mx-auto px-6';
  const align = layout === 'centered' ? 'text-center' : '';

  return (
    <section id={id} className={[base, align, className].filter(Boolean).join(' ')}>
      <div className={container}>{element}</div>
    </section>
  );
};
