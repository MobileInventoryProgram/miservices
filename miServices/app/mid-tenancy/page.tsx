import { Metadata } from 'next';
import Link from 'next/link';
import { FiCheckCircle, FiClipboard, FiShield, FiHome, FiCamera, FiTool } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'Mid-Tenancy | Property Visit & Inspection Guide',
  description: 'Learn what happens during mid-tenancy inspections and why they matter.',
  keywords: 'mid-tenancy, property visit, mid-tenancy inspection, rental property maintenance, property condition check',
};

export default function MidTenancy() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-helvetica">Mid-Tenancy</h1>
          <p className="text-xl md:text-2xl max-w-3xl leading-relaxed opacity-95">
            Mid-tenancy inspections ensure the property is being looked after and identify issues before they become costly. This supports landlords and managers in maintaining compliance and tenant satisfaction.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">What Happens During Mid-Tenancy</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <FiHome className="w-6 h-6" />, text: 'Property condition check' },
              { icon: <FiShield className="w-6 h-6" />, text: 'Occupancy & safety review' },
              { icon: <FiTool className="w-6 h-6" />, text: 'Maintenance notes' },
              { icon: <FiCamera className="w-6 h-6" />, text: 'Photographic evidence' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="text-brand-light-blue mt-1 mr-3 flex-shrink-0">
                  {item.icon}
                </div>
                <span className="text-gray-700">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">Why Mid-Tenancy Matters</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <BenefitCard 
              icon={<FiShield className="w-12 h-12 text-brand-light-blue" />}
              title="Prevents Long-Term Damage"
              description="Early identification of issues prevents small problems from becoming expensive repairs"
            />
            <BenefitCard 
              icon={<FiCheckCircle className="w-12 h-12 text-brand-light-blue" />}
              title="Ensures Compliance"
              description="Regular checks help landlords and agents meet their legal management obligations"
            />
            <BenefitCard 
              icon={<FiTool className="w-12 h-12 text-brand-light-blue" />}
              title="Identifies Repairs Early"
              description="Catch maintenance issues before they escalate, protecting property value"
            />
            <BenefitCard 
              icon={<FiClipboard className="w-12 h-12 text-brand-light-blue" />}
              title="Meets Management Obligations"
              description="Helps letting agents fulfill their duty of care to landlords and tenants"
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">Related Services</h2>
          <div className="grid md:grid-cols-1 gap-8 max-w-2xl mx-auto">
            <Link href="/property-visits" className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group">
              <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">Property Visits</h3>
              <p className="text-gray-600 mb-4">Regular mid-tenancy property visits to identify maintenance issues and ensure compliance</p>
              <span className="text-brand-light-blue font-bold group-hover:underline">Learn more →</span>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-helvetica">Schedule Your Mid-Tenancy Visit</h2>
          <p className="text-xl mb-8 opacity-95">Protect your property and maintain compliance with regular professional inspections</p>
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

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg hover:shadow-lg transition-all">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-brand-dark-blue font-helvetica">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
