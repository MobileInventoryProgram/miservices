import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobileinventoryservices.co.uk';

export const metadata: Metadata = {
  title: 'Property Inventory Franchise UK | Start from £995 | miServices',
  description: 'Join the UK\'s leading property inventory franchise network. Low startup costs from £995, full training, proven business model, and 65+ territories. Build a profitable property reporting business.',
  openGraph: {
    title: 'Property Inventory Franchise UK | Start from £995 | miServices',
    description: 'Join the UK\'s leading property inventory franchise network. Low startup costs, full training, and a proven business model.',
    url: `${BASE_URL}/franchise`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Property Inventory Franchise UK | Start from £995 | miServices',
    description: 'Join the UK\'s leading property inventory franchise network. Low startup costs from £995.',
  },
  alternates: {
    canonical: `${BASE_URL}/franchise`,
  },
};

export default function FranchiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
