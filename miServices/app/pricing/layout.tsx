import { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobileinventoryservices.co.uk';

export const metadata: Metadata = {
  title: 'Pricing | Request Local Property Reporting Prices | miServices',
  description: 'miServices pricing varies by territory. Request an accurate price list for your area and learn more about our national network of professional property reporting specialists.',
  keywords: 'property inventory pricing, inventory report cost, check-in check-out pricing, property visit pricing, inventory clerk prices, property inspection prices UK, request price list, regional pricing property reporting, local inventory clerk prices',
  openGraph: {
    title: 'Pricing | Request Local Property Reporting Prices | miServices',
    description: 'miServices pricing varies by territory. Request an accurate price list for your area.',
    type: 'website',
    url: `${BASE_URL}/pricing`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing | Request Local Property Reporting Prices | miServices',
    description: 'miServices pricing varies by territory. Request an accurate price list for your area.',
  },
  alternates: {
    canonical: `${BASE_URL}/pricing`,
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
