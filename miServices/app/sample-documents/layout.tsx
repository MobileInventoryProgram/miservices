import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sample Property Reports - Inventory, Check-Out & Visit Samples | miServices',
  description: 'View sample property inventory reports, check-out documentation, and mid-tenancy property visit reports. See firsthand how our detailed documentation protects both landlords and tenants.',
  keywords: 'inventory report sample, check-out report sample, property visit report, property inspection samples, miServices samples',
  openGraph: {
    title: 'Sample Property Reports - Inventory, Check-Out & Visit Samples | miServices',
    description: 'View sample property inventory reports, check-out documentation, and mid-tenancy property visit reports. See firsthand how our detailed documentation protects both landlords and tenants.',
    url: 'https://miservices.co.uk/sample-documents',
    siteName: 'miServices',
    type: 'website',
    images: [
      {
        url: 'https://miservices.co.uk/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'miServices Sample Documents',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sample Property Reports - Inventory, Check-Out & Visit Samples | miServices',
    description: 'View sample property inventory reports, check-out documentation, and mid-tenancy property visit reports.',
  },
};

export default function SampleDocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
