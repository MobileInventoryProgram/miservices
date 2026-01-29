import { Metadata } from 'next';
import Link from 'next/link';
import { FiCheckCircle, FiUsers, FiClock, FiFileText, FiShield } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'Services for Letting Agents | Outsourced Property Reporting',
  description: 'Inventory, check-in, check-out & inspection solutions for letting agents.',
  keywords: 'letting agents inventory service, property reports for agents, outsourced inspections, lettings compliance',
};

export default function LettingsAgents() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-helvetica">Services for Lettings Agents</h1>
          <p className="text-xl md:text-2xl max-w-3xl leading-relaxed opacity-95">
            miServices supports letting agents with fast, consistent, and compliant property reports — from inventory to check-out. Designed to streamline your workflow and improve reporting accuracy across your portfolio.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-brand-dark-blue font-helvetica">How We Help Lettings Agents</h2>
          <p className="text-lg text-gray-700 max-w-4xl leading-relaxed mb-8">
            Running a busy lettings agency means balancing client expectations, compliance requirements, and operational efficiency. miServices takes the burden of property inspections off your hands, allowing you to focus on what you do best — growing your business and serving your clients.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Outsourced inventory & inspection services',
              'Mid-tenancy visits',
              'End-of-tenancy check-outs',
              'Digital reporting',
              'Fast turnaround',
              'Nationwide coverage'
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
              <p className="text-gray-600 mb-4">Comprehensive property documentation at the start of tenancies</p>
              <span className="text-brand-light-blue font-medium">Learn more →</span>
            </Link>
            <Link href="/check-ins" className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group">
              <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">Check-In Services</h3>
              <p className="text-gray-600 mb-4">Professional tenant move-in services with detailed reporting</p>
              <span className="text-brand-light-blue font-medium">Learn more →</span>
            </Link>
            <Link href="/check-outs" className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group">
              <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">Check-Out Inspections</h3>
              <p className="text-gray-600 mb-4">End of tenancy inspections for deposit negotiations</p>
              <span className="text-brand-light-blue font-medium">Learn more →</span>
            </Link>
            <Link href="/property-visits" className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group">
              <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">Property Visits</h3>
              <p className="text-gray-600 mb-4">Regular mid-tenancy inspections to maintain property standards</p>
              <span className="text-brand-light-blue font-medium">Learn more →</span>
            </Link>
            <Link href="/block-management" className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group">
              <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">Block Management</h3>
              <p className="text-gray-600 mb-4">Comprehensive inspections for multi-unit properties</p>
              <span className="text-brand-light-blue font-medium">Learn more →</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">Why Letting Agents Choose Us</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <BenefitCard 
              icon={<FiUsers className="w-12 h-12 text-brand-light-blue" />}
              title="Nationwide Coverage"
              description="Consistent service across all your properties, wherever they are"
            />
            <BenefitCard 
              icon={<FiShield className="w-12 h-12 text-brand-light-blue" />}
              title="Professional Clerks"
              description="Trained, experienced operatives delivering quality reports"
            />
            <BenefitCard 
              icon={<FiFileText className="w-12 h-12 text-brand-light-blue" />}
              title="Consistent Formatting"
              description="Standardized reports that meet industry compliance standards"
            />
            <BenefitCard 
              icon={<FiClock className="w-12 h-12 text-brand-light-blue" />}
              title="Reduced Admin Workload"
              description="Free up your team to focus on core business activities"
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-helvetica">Ready to Streamline Your Operations?</h2>
          <p className="text-xl mb-8 opacity-95">Join hundreds of lettings agents who trust miServices for their property inspections</p>
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
