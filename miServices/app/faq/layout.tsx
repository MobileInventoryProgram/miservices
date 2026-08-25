import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobileinventoryservices.co.uk';

export const metadata: Metadata = {
  title: 'FAQs | miServices',
  description: 'Find answers to frequently asked questions about miServices, including property reports, bookings, pricing, territories, and franchise opportunities.',
  openGraph: {
    title: 'FAQs | miServices',
    description: 'Find answers to frequently asked questions about miServices, including property reports, bookings, pricing, territories, and franchise opportunities.',
    url: `${BASE_URL}/faq`,
    siteName: 'miServices',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQs | miServices',
    description: 'Find answers to frequently asked questions about miServices, including property reports, bookings, pricing, territories, and franchise opportunities.',
  },
  alternates: {
    canonical: `${BASE_URL}/faq`,
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
