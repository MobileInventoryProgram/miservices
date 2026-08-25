import { Metadata } from 'next';
import { getSinglePage } from '@/lib/sanity';
import PortableText from '@/components/PortableText';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobileinventoryservices.co.uk';

export const metadata: Metadata = {
  title: 'Privacy Policy | miServices',
  description: 'miServices privacy policy. Learn how we collect, use, and protect your personal information.',
  alternates: {
    canonical: `${BASE_URL}/privacy-policy`,
  },
};

export default async function PrivacyPolicy() {
  const page = await getSinglePage('privacy-policy');

  if (!page) {
    notFound();
  }

  const lastUpdated = page.publishedAt
    ? new Date(page.publishedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-helvetica">{page.title}</h1>
          {lastUpdated && <p className="text-xl">Last updated: {lastUpdated}</p>}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-8 md:p-12 rounded-lg shadow-md">
          <PortableText value={page.body} />
        </div>
      </div>
    </div>
  );
}
