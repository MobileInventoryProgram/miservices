import { Metadata } from 'next';
import Link from 'next/link';
import { FiCheckCircle, FiClipboard, FiShield, FiKey, FiCamera, FiFileText } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'End of Tenancy | Check-Out & Deposit Dispute Protection',
  description: 'End-of-tenancy process explained — check-outs, deposit disputes, and reporting.',
  keywords: 'end of tenancy, check-out, deposit disputes, move-out inspection, tenancy end process',
};

export default function EndTenancy() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-helvetica">End-Tenancy</h1>
          <p className="text-xl md:text-2xl max-w-3xl leading-relaxed opacity-95">
            The end-of-tenancy stage determines how the final deposit is handled. A professional check-out inspection protects all parties by documenting changes against the original inventory.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">What Happens During End-Tenancy</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <FiFileText className="w-6 h-6" />, text: 'Condition comparison' },
              { icon: <FiClipboard className="w-6 h-6" />, text: 'Damage & cleaning notes' },
              { icon: <FiKey className="w-6 h-6" />, text: 'Key return confirmation' },
              { icon: <FiCamera className="w-6 h-6" />, text: 'Meter readings' }
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
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">Why End-Tenancy Matters</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <BenefitCard 
              icon={<FiShield className="w-12 h-12 text-brand-light-blue" />}
              title="Fair Deposit Resolution"
              description="Professional documentation ensures deposits are handled fairly for both landlords and tenants"
            />
            <BenefitCard 
              icon={<FiCheckCircle className="w-12 h-12 text-brand-light-blue" />}
              title="Dispute Prevention"
              description="Clear evidence-based reporting minimizes the risk of lengthy deposit disputes"
            />
            <BenefitCard 
              icon={<FiFileText className="w-12 h-12 text-brand-light-blue" />}
              title="Legal Protection"
              description="Comprehensive reports provide legally recognized evidence if disputes arise"
            />
            <BenefitCard 
              icon={<FiClipboard className="w-12 h-12 text-brand-light-blue" />}
              title="Professional Documentation"
              description="Detailed comparison reports show exact changes from the start of tenancy"
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">Related Services</h2>
          <div className="grid md:grid-cols-1 gap-8 max-w-2xl mx-auto">
            <Link href="/check-outs" className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group">
              <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">Check-Out Reports</h3>
              <p className="text-gray-600 mb-4">Professional end-of-tenancy inspections with detailed condition comparisons and evidence for deposit disputes</p>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-helvetica">Book Your End-Tenancy Check-Out</h2>
          <p className="text-xl mb-8 opacity-95">Protect deposits and prevent disputes with professional check-out inspections</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/booking"
              className="bg-white text-brand-dark-blue px-10 py-4 rounded-md font-bold hover:bg-gray-100 transition-all text-lg"
            >
              Book a Check-Out Inspection
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
