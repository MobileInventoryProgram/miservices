import { Metadata } from 'next';
import Link from 'next/link';
import { FiCheckCircle, FiUsers, FiShield, FiFileText, FiClock } from 'react-icons/fi';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobileinventoryservices.co.uk';

export const metadata: Metadata = {
  title: 'Services for Property Managers | Portfolio Reporting',
  description: 'Professional reporting, compliance checks & block management services for property managers. Nationwide coverage with consistent standards.',
  keywords: 'property management inspections, portfolio reporting, block management, compliance checks',
  openGraph: {
    title: 'Services for Property Managers | Portfolio Reporting | miServices',
    description: 'Professional reporting, compliance checks & block management services for property managers.',
    url: `${BASE_URL}/property-managers`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Services for Property Managers | miServices',
    description: 'Professional reporting, compliance checks & block management services for property managers.',
  },
  alternates: {
    canonical: `${BASE_URL}/property-managers`,
  },
};

export default function PropertyManagers() {
  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-brand-dark-blue to-brand-light-blue text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1200 800" fill="none" className="w-full h-full">
            <path d="M 0 400 Q 300 200 600 400 Q 900 600 1200 400 L 1200 800 L 0 800 Z" fill="white"/>
            <path d="M 0 500 Q 300 300 600 500 Q 900 700 1200 500 L 1200 800 L 0 800 Z" fill="white" opacity="0.5"/>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-helvetica">Services for Property Managers</h1>
          <p className="text-xl md:text-2xl max-w-3xl leading-relaxed opacity-95">
            Property managers rely on miServices for portfolio-wide reporting, scheduled inspections, block management checks, and accurate compliance documentation.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-brand-dark-blue font-helvetica">What We Offer</h2>
          <p className="text-lg text-gray-700 max-w-4xl leading-relaxed mb-8">
            Managing multiple properties requires reliable, consistent inspection services. Our nationwide network ensures you receive the same high-quality service across all your properties, regardless of location. We understand the unique challenges of portfolio management and provide tailored solutions to meet your needs.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Block management inspections',
              'Mid-tenancy visits',
              'Portfolio-wide scheduling',
              'Custom reporting formats',
              'Compliance checks',
              'Dedicated account management'
            ].map((item, idx) => (
              <div key={idx} className="flex items-start bg-gray-50 p-4 rounded-lg">
                <FiCheckCircle className="text-brand-light-blue mt-1 mr-3 flex-shrink-0 w-6 h-6" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">Our Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link href="/inventory-reports" className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group">
              <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">Inventory Reports</h3>
              <p className="text-gray-600 mb-4">Comprehensive property documentation for your entire portfolio</p>
              <span className="text-brand-light-blue font-medium">Learn more →</span>
            </Link>
            <Link href="/check-ins" className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group">
              <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">Check-In Services</h3>
              <p className="text-gray-600 mb-4">Professional move-in inspections with standardized reporting</p>
              <span className="text-brand-light-blue font-medium">Learn more →</span>
            </Link>
            <Link href="/check-outs" className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group">
              <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">Check-Out Inspections</h3>
              <p className="text-gray-600 mb-4">Evidence-based end-of-tenancy reports for deposit management</p>
              <span className="text-brand-light-blue font-medium">Learn more →</span>
            </Link>
            <Link href="/property-visits" className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group">
              <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">Property Visits</h3>
              <p className="text-gray-600 mb-4">Scheduled mid-tenancy inspections to maintain standards</p>
              <span className="text-brand-light-blue font-medium">Learn more →</span>
            </Link>
            <Link href="/block-management" className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group">
              <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">Block Management</h3>
              <p className="text-gray-600 mb-4">Specialist inspections for multi-unit properties and developments</p>
              <span className="text-brand-light-blue font-medium">Learn more →</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">Why Property Managers Choose Us</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <BenefitCard 
              icon={<FiUsers className="w-12 h-12 text-brand-light-blue" />}
              title="Portfolio-Wide Consistency"
              description="Same quality standards across all your properties"
            />
            <BenefitCard 
              icon={<FiShield className="w-12 h-12 text-brand-light-blue" />}
              title="Compliance Assured"
              description="Reports that meet all regulatory requirements"
            />
            <BenefitCard 
              icon={<FiFileText className="w-12 h-12 text-brand-light-blue" />}
              title="Custom Reporting"
              description="Tailored formats to match your management systems"
            />
            <BenefitCard 
              icon={<FiClock className="w-12 h-12 text-brand-light-blue" />}
              title="Flexible Scheduling"
              description="Coordinate inspections across multiple properties easily"
            />
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-brand-light-blue to-brand-dark-blue text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1200 800" fill="none" className="w-full h-full">
            <path d="M 0 400 Q 300 200 600 400 Q 900 600 1200 400 L 1200 800 L 0 800 Z" fill="white"/>
          </svg>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-helvetica">Let's Discuss Your Portfolio</h2>
          <p className="text-xl mb-8 opacity-95">We offer customized solutions for property management companies of all sizes</p>
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

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-all text-center">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-brand-dark-blue font-helvetica">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
