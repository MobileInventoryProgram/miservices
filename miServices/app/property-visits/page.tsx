import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { FiCheckCircle, FiCamera, FiClipboard, FiShield, FiAlertCircle, FiHome } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'Property Visits | Mid-Tenancy Inspections',
  description: 'Routine mid-tenancy inspections to protect property condition and identify issues early.',
  keywords: 'property visits, mid-tenancy inspection, property inspection, rental property check, interim inspection',
};

export default function PropertyVisits() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-helvetica">Property Visits</h1>
          <p className="text-xl md:text-2xl max-w-3xl leading-relaxed opacity-95">
            Regular mid-tenancy property visits help landlords and agents stay compliant, identify maintenance issues early, and ensure the property is being looked after. Our clerks provide clear, evidence-backed mid-tenancy reports with actionable recommendations.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-brand-dark-blue font-helvetica">What Is a Property Visit?</h2>
          <p className="text-lg text-gray-700 max-w-4xl leading-relaxed mb-12">
            A property visit (also known as a mid-tenancy inspection) is a scheduled assessment during an active tenancy. It verifies occupancy, checks property condition, identifies maintenance needs, and ensures the property is being cared for according to tenancy terms.
          </p>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-brand-dark-blue font-helvetica">Proactive Property Management</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Regular property visits help identify maintenance issues early, ensuring tenant comfort and protecting your investment throughout the tenancy.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our detailed reports give you complete visibility into property condition and tenant compliance.
              </p>
            </div>
            <div className="relative">
              <Image 
                src="/stock_images/residential_property_1cdd648d.jpg"
                alt="Residential property exterior inspection"
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
              'Occupancy verification',
              'Property condition review',
              'Safety observations',
              'Maintenance issues logged',
              'Photographs of all areas',
              'Recommendations for follow-up'
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
              title="Trained Professionals"
              description="Experienced clerks who know what to look for"
            />
            <ReasonCard 
              icon={<FiAlertCircle className="w-12 h-12 text-brand-light-blue" />}
              title="Early Issue Detection"
              description="Identify problems before they become costly"
            />
            <ReasonCard 
              icon={<FiClipboard className="w-12 h-12 text-brand-light-blue" />}
              title="Detailed Reports"
              description="Clear documentation with actionable recommendations"
            />
            <ReasonCard 
              icon={<FiCamera className="w-12 h-12 text-brand-light-blue" />}
              title="Photographic Evidence"
              description="Visual documentation of property condition"
            />
            <ReasonCard 
              icon={<FiHome className="w-12 h-12 text-brand-light-blue" />}
              title="Compliance Support"
              description="Help meet your property management obligations"
            />
            <ReasonCard 
              icon={<FiCheckCircle className="w-12 h-12 text-brand-light-blue" />}
              title="Fast Turnaround"
              description="Quick reports so you can act promptly"
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">Who Uses This Service</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Link href="/lettings-agents" className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group">
              <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">Lettings Agents</h3>
              <p className="text-gray-600">Stay on top of portfolio maintenance with regular inspections</p>
            </Link>
            <Link href="/property-managers" className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group">
              <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">Property Managers</h3>
              <p className="text-gray-600">Scheduled visits across your entire property portfolio</p>
            </Link>
            <Link href="/landlords" className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group">
              <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">Landlords</h3>
              <p className="text-gray-600">Peace of mind that your property is being properly maintained</p>
            </Link>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-helvetica">Ready to Schedule a Property Visit?</h2>
          <p className="text-xl mb-8 opacity-95">Protect your property with regular professional inspections</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/booking"
              className="bg-white text-brand-dark-blue px-10 py-4 rounded-md font-bold hover:bg-gray-100 transition-all text-lg"
            >
              Book a Property Visit
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

function ReasonCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-all">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-brand-dark-blue font-helvetica">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
