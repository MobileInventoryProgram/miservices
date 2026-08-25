import { Metadata } from 'next';
import Link from 'next/link';
import { getServices } from '@/lib/sanity';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobileinventoryservices.co.uk';

export const metadata: Metadata = {
  title: 'Our Services | Property Inventory & Inspection Services | miServices',
  description: 'Professional property inspection and inventory services for landlords, letting agents, and property managers across the UK. Inventory reports, check-ins, check-outs, mid-tenancy visits and more.',
  keywords: 'property inspection, inventory services, check-in, check-out, mid-tenancy, pre-tenancy, property visits',
  openGraph: {
    title: 'Our Services | Property Inventory & Inspection Services | miServices',
    description: 'Professional property inspection and inventory services across the UK.',
    url: `${BASE_URL}/services`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Services | miServices',
    description: 'Professional property inspection and inventory services across the UK.',
  },
  alternates: {
    canonical: `${BASE_URL}/services`,
  },
};

export const revalidate = 60;

export default async function ServicesPage() {
  const services = await getServices();

  // Fallback static services if none in CMS yet
  const staticServices = [
    { slug: 'pre-tenancy', title: 'Pre-Tenancy', description: 'Property preparation and documentation before tenancy begins' },
    { slug: 'check-ins', title: 'Check-Ins', description: 'Professional move-in inspections and tenant handover' },
    { slug: 'mid-tenancy', title: 'Mid-Tenancy', description: 'Regular property inspections during tenancy' },
    { slug: 'check-outs', title: 'Check-Outs', description: 'End of tenancy inspections and deposit assessment' },
    { slug: 'inventory-reports', title: 'Inventory Reports', description: 'Comprehensive property documentation with photography' },
    { slug: 'property-visits', title: 'Property Visits', description: 'Routine property checks and condition monitoring' },
    { slug: 'block-management', title: 'Block Management', description: 'Multi-unit property management services' },
    { slug: 'end-tenancy', title: 'End-Tenancy', description: 'Full end of tenancy services and reporting' },
  ];

  const displayServices = services.length > 0 ? services : staticServices;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-dark-blue to-brand-light-blue text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1200 800" fill="none" className="w-full h-full">
            <path d="M 0 400 Q 300 200 600 400 Q 900 600 1200 400 L 1200 800 L 0 800 Z" fill="white"/>
            <path d="M 0 500 Q 300 300 600 500 Q 900 700 1200 500 L 1200 800 L 0 800 Z" fill="white" opacity="0.5"/>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-helvetica">Our Services</h1>
          <p className="text-xl md:text-2xl max-w-3xl leading-relaxed opacity-95">
            Professional property inspection and inventory services delivered by our nationwide network of trained operatives.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayServices.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group"
              >
                <h2 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">
                  {service.title}
                </h2>
                <p className="text-gray-600 mb-4">
                  {'heroDescription' in service ? service.heroDescription : service.description}
                </p>
                <span className="text-brand-light-blue font-bold group-hover:underline">Learn more &rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-brand-light-blue to-brand-dark-blue text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1200 800" fill="none" className="w-full h-full">
            <path d="M 0 400 Q 300 200 600 400 Q 900 600 1200 400 L 1200 800 L 0 800 Z" fill="white"/>
          </svg>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-helvetica">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-95">Book your property inspection service today or find your local operative</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/booking"
              className="bg-white text-brand-dark-blue px-10 py-4 rounded-md font-bold hover:bg-gray-100 transition-all text-lg"
            >
              Book a Service
            </Link>
            <Link
              href="/our-network"
              className="border-2 border-white text-white px-10 py-4 rounded-md font-bold hover:bg-white hover:text-brand-dark-blue transition-all text-lg"
            >
              Find Your Local Operative
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
