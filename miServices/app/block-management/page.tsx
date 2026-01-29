import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { FiCheckCircle, FiShield, FiClipboard, FiAlertTriangle, FiUsers, FiClock } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'Block Management Inspections | Multi-Unit Reporting',
  description: 'Scheduled inspections & compliance checks for block management companies.',
  keywords: 'block management, multi-unit property, communal area inspection, building compliance, property block inspection',
};

export default function BlockManagement() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-helvetica">Block Management Inspections</h1>
          <p className="text-xl md:text-2xl max-w-3xl leading-relaxed opacity-95">
            miServices supports block management companies with routine inspections, compliance checks, and structured reporting across multi-unit properties. Reliable, timely, and designed to support portfolio-wide consistency.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-brand-dark-blue font-helvetica">What Are Block Management Inspections?</h2>
          <p className="text-lg text-gray-700 max-w-4xl leading-relaxed mb-12">
            Block management inspections assess communal areas, safety systems, and overall building condition in multi-unit properties. They ensure compliance with health and safety regulations, identify maintenance needs, and support effective property management.
          </p>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-brand-dark-blue font-helvetica">Multi-Unit Excellence</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our block management inspections ensure communal areas, fire safety systems, and building infrastructure are maintained to the highest standards.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Scheduled reports provide consistency and compliance across your entire property portfolio.
              </p>
            </div>
            <div className="relative">
              <Image 
                src="/stock_images/apartment_building_e_86a30c47.jpg"
                alt="Apartment building block management inspection"
                width={800}
                height={600}
                className="rounded-xl shadow-lg border-4 border-brand-light-blue/20 w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">What's Included</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Communal area inspections',
              'Fire safety observations',
              'Maintenance & risk logs',
              'Photo documentation',
              'Regular, scheduled visits',
              'Tailored reporting for your site'
            ].map((item, idx) => (
              <div key={idx} className="flex items-start bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <FiCheckCircle className="text-brand-light-blue mt-1 mr-3 flex-shrink-0 w-6 h-6" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">Why Choose miServices</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ReasonCard 
              icon={<FiShield className="w-12 h-12 text-brand-light-blue" />}
              title="Compliance Focused"
              description="Thorough checks ensuring regulatory compliance"
            />
            <ReasonCard 
              icon={<FiClipboard className="w-12 h-12 text-brand-light-blue" />}
              title="Tailored Reporting"
              description="Custom reports designed for your specific needs"
            />
            <ReasonCard 
              icon={<FiAlertTriangle className="w-12 h-12 text-brand-light-blue" />}
              title="Risk Management"
              description="Early identification of safety and maintenance issues"
            />
            <ReasonCard 
              icon={<FiUsers className="w-12 h-12 text-brand-light-blue" />}
              title="Experienced Team"
              description="Specialist clerks trained in block management"
            />
            <ReasonCard 
              icon={<FiClock className="w-12 h-12 text-brand-light-blue" />}
              title="Scheduled Visits"
              description="Regular inspections on your preferred schedule"
            />
            <ReasonCard 
              icon={<FiCheckCircle className="w-12 h-12 text-brand-light-blue" />}
              title="Nationwide Coverage"
              description="Consistent service across all your properties"
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">Who Uses This Service</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue">
              <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica">Block Managers</h3>
              <p className="text-gray-600">Comprehensive inspection services for residential and commercial blocks</p>
            </div>
            <Link href="/property-managers" className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group">
              <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">Property Managers</h3>
              <p className="text-gray-600">Multi-site management with consistent reporting standards</p>
            </Link>
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue">
              <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica">Housing Associations</h3>
              <p className="text-gray-600">Large-scale inspection programs for social housing portfolios</p>
            </div>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-helvetica">Ready to Discuss Your Block Management Needs?</h2>
          <p className="text-xl mb-8 opacity-95">Get professional inspection services tailored to your multi-unit properties</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/contact"
              className="bg-white text-brand-dark-blue px-10 py-4 rounded-md font-bold hover:bg-gray-100 transition-all text-lg"
            >
              Speak to Our Block Management Team
            </Link>
            <Link
              href="/booking"
              className="border-2 border-white text-white px-10 py-4 rounded-md font-bold hover:bg-white hover:text-brand-dark-blue transition-all text-lg"
            >
              Book an Inspection
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ReasonCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-all">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-brand-dark-blue font-helvetica">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
