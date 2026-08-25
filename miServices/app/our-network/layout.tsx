import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobileinventoryservices.co.uk';

export const metadata: Metadata = {
  title: 'Our Network | Find Your Local Inventory Clerk | miServices',
  description: 'Find your local miServices inventory clerk across the UK. Search by postcode, town or territory to connect with your nearest property inspection professional.',
  openGraph: {
    title: 'Our Network | Find Your Local Inventory Clerk | miServices',
    description: 'Find your local miServices inventory clerk across the UK. Search by postcode, town or territory to connect with your nearest property inspection professional.',
    url: `${BASE_URL}/our-network`,
    siteName: 'miServices',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Network | Find Your Local Inventory Clerk | miServices',
    description: 'Find your local miServices inventory clerk across the UK. Search by postcode, town or territory.',
  },
  alternates: {
    canonical: `${BASE_URL}/our-network`,
  },
};

export default function OurNetworkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
