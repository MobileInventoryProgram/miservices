'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMembers = pathname.startsWith('/members');
  const isStudio = pathname.startsWith('/studio');
  const isSharedPriceList = pathname.startsWith('/price-list');
  const isSharedQuote = pathname.startsWith('/quote/');

  if (isMembers || isStudio || isSharedPriceList || isSharedQuote) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
