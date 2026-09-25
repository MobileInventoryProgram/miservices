'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { SiteSettings } from '@/lib/cms/types';
import { SiteSettingsProvider } from '@/components/providers/SiteSettingsProvider';

export default function ConditionalLayout({ children, site }: { children: React.ReactNode; site: SiteSettings }) {
  const pathname = usePathname();
  const isMembers = pathname.startsWith('/members');
  const isStudio = pathname.startsWith('/studio');
  const isSharedPriceList = pathname.startsWith('/price-list');
  const isSharedQuote = pathname.startsWith('/quote/');

  if (isMembers || isStudio || isSharedPriceList || isSharedQuote) {
    return <SiteSettingsProvider site={site}>{children}</SiteSettingsProvider>;
  }

  return (
    <SiteSettingsProvider site={site}>
      <Header site={site} />
      <main>{children}</main>
      <Footer site={site} />
    </SiteSettingsProvider>
  );
}
