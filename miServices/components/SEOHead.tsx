import { Metadata } from 'next';

export function generateLocalSEO(
  title: string,
  description: string,
  location?: {
    name: string;
    region: string;
    postcode: string;
  }
): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://miservices.co.uk';
  
  const metadata: Metadata = {
    title: `${title} | miServices`,
    description,
    keywords: 'property inspection, inventory reports, check-in, check-out, property management',
    openGraph: {
      title: `${title} | miServices`,
      description,
      url: baseUrl,
      siteName: 'miServices',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | miServices`,
      description,
    },
  };

  if (location) {
    metadata.description = `${description} Serving ${location.region}, ${location.postcode}`;
  }

  return metadata;
}
