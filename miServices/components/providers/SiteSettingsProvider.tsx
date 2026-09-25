'use client';

import { createContext, useContext } from 'react';
import type { SiteSettings } from '@/lib/cms/types';

const SiteSettingsContext = createContext<SiteSettings>({ siteName: 'miServices' });

/** Site Settings for client components (calendar pop-up, forms…) */
export function SiteSettingsProvider({ site, children }: { site: SiteSettings; children: React.ReactNode }) {
  return <SiteSettingsContext.Provider value={site}>{children}</SiteSettingsContext.Provider>;
}

export const useSiteSettings = () => useContext(SiteSettingsContext);
