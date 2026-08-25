import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobileinventoryservices.co.uk';

export const metadata: Metadata = {
  title: 'News & Updates | miServices',
  description: 'Stay up to date with the latest news, insights, and updates from miServices. Read about property inspection trends, franchise success stories, and industry developments.',
  openGraph: {
    title: 'News & Updates | miServices',
    description: 'Stay up to date with the latest news, insights, and updates from miServices. Property inspection trends, franchise success stories, and industry developments.',
    url: `${BASE_URL}/news`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'News & Updates | miServices',
    description: 'Latest news, insights, and updates from miServices.',
  },
  alternates: {
    canonical: `${BASE_URL}/news`,
  },
};

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
