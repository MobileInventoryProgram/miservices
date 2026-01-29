import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQs | miServices',
  description: 'Find answers to frequently asked questions about miServices, including property reports, bookings, pricing, territories, and franchise opportunities.',
  openGraph: {
    title: 'FAQs | miServices',
    description: 'Find answers to frequently asked questions about miServices, including property reports, bookings, pricing, territories, and franchise opportunities.',
    type: 'website',
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
