import { Metadata } from 'next';
import Link from 'next/link';
import { FiCheckCircle, FiHome, FiShield, FiDollarSign, FiFileText } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'Services for Landlords | Inventory & Inspections',
  description: 'Professional inventory reports, inspections & check-outs for landlords.',
  keywords: 'landlord property inspections, inventory reports for landlords, deposit protection, property checks',
};

export default function Landlords() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-helvetica">Services for Landlords</h1>
          <p className="text-xl md:text-2xl max-w-3xl leading-relaxed opacity-95">
            Landlords need accurate, unbiased reporting to protect their investment. miServices provides inventory reports, inspections, and check-outs tailored for individual or portfolio landlords.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-brand-dark-blue font-helvetica">Services for Landlords</h2>
          <p className="text-lg text-gray-700 max-w-4xl leading-relaxed mb-8">
            Whether you're a landlord with a single property or a portfolio, our professional inspection services give you peace of mind and protect your investment. We provide independent, impartial reporting that stands up to scrutiny and protects all parties.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Inventory reporting',
              'Check-ins & check-outs',
              'Regular property visits',
              'Maintenance observations',
              'Deposit dispute protection',
              'Independent, unbiased reports'
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
              <p className="text-gray-600 mb-4">Detailed documentation of your property's condition and contents</p>
              <span className="text-brand-light-blue font-medium">Learn more →</span>
            </Link>
            <Link href="/check-ins" className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group">
              <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">Check-In Services</h3>
              <p className="text-gray-600 mb-4">Professional tenant move-in inspections</p>
              <span className="text-brand-light-blue font-medium">Learn more →</span>
            </Link>
            <Link href="/check-outs" className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group">
              <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">Check-Out Inspections</h3>
              <p className="text-gray-600 mb-4">Comprehensive end-of-tenancy inspections</p>
              <span className="text-brand-light-blue font-medium">Learn more →</span>
            </Link>
            <Link href="/property-visits" className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group">
              <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">Property Visits</h3>
              <p className="text-gray-600 mb-4">Regular checks to ensure property standards are maintained</p>
              <span className="text-brand-light-blue font-medium">Learn more →</span>
            </Link>
            <Link href="/block-management" className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group">
              <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">Block Management</h3>
              <p className="text-gray-600 mb-4">Inspections for multi-unit property owners</p>
              <span className="text-brand-light-blue font-medium">Learn more →</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">Why Landlords Choose Us</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <BenefitCard 
              icon={<FiHome className="w-12 h-12 text-brand-light-blue" />}
              title="Property Protection"
              description="Comprehensive documentation safeguards your investment"
            />
            <BenefitCard 
              icon={<FiShield className="w-12 h-12 text-brand-light-blue" />}
              title="Independent Reports"
              description="Impartial, professional inspections you can trust"
            />
            <BenefitCard 
              icon={<FiDollarSign className="w-12 h-12 text-brand-light-blue" />}
              title="Deposit Protection"
              description="Clear evidence for fair deposit resolutions"
            />
            <BenefitCard 
              icon={<FiFileText className="w-12 h-12 text-brand-light-blue" />}
              title="Professional Documentation"
              description="Legally compliant reports that stand up in disputes"
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <ProcessStep number="1" title="Book Online" description="Choose your service and select a convenient date" />
            <ProcessStep number="2" title="Professional Inspection" description="Our trained operative visits your property" />
            <ProcessStep number="3" title="Quality Check" description="Report is produced and quality checked" />
            <ProcessStep number="4" title="Report Delivered" description="Digital report delivered within 24-48 hours" />
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-helvetica">Protect Your Investment Today</h2>
          <p className="text-xl mb-8 opacity-95">Professional property inspections to safeguard your rental property</p>
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

function ProcessStep({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-dark-blue text-white font-bold text-xl mb-4">
        {number}
      </div>
      <h4 className="font-bold text-lg mb-2 font-helvetica">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
