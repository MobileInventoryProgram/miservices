import { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobileinventoryservices.co.uk';

export const metadata: Metadata = {
  title: 'Sample Property Reports - Inventory, Check-Out & Visit Samples | miServices',
  description: 'View sample property inventory reports, check-out documentation, and mid-tenancy property visit reports. See firsthand how our detailed documentation protects both landlords and tenants.',
  keywords: 'inventory report sample, check-out report sample, property visit report, property inspection samples, miServices samples',
  openGraph: {
    title: 'Sample Property Reports - Inventory, Check-Out & Visit Samples | miServices',
    description: 'View sample property inventory reports, check-out documentation, and mid-tenancy property visit reports.',
    url: `${BASE_URL}/sample-documents`,
    siteName: 'miServices',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sample Property Reports | miServices',
    description: 'View sample property inventory reports, check-out documentation, and mid-tenancy property visit reports.',
  },
  alternates: {
    canonical: `${BASE_URL}/sample-documents`,
  },
};

export default function SampleDocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
