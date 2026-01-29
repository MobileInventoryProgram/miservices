import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { FiCheckCircle, FiCamera, FiClipboard, FiShield, FiFileText } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'Check-Out Inspections | End of Tenancy Reports',
  description: 'Evidence-based end-of-tenancy check-out reports for deposit disputes and compliance.',
  keywords: 'check-out inspection, end of tenancy, deposit disputes, move-out inspection, tenancy check-out',
};

export default function CheckOuts() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-helvetica">Check-Out Inspections</h1>
          <p className="text-xl md:text-2xl max-w-3xl leading-relaxed opacity-95">
            Our detailed check-out inspections compare the end-of-tenancy condition against the original inventory and check-in report, highlighting changes, wear and tear, cleaning needs, and potential tenant liabilities. Designed for deposit dispute clarity.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-brand-dark-blue font-helvetica">What Is a Check-Out Inspection?</h2>
          <p className="text-lg text-gray-700 max-w-4xl leading-relaxed mb-12">
            A check-out inspection is the final property assessment at the end of a tenancy. It documents the property condition, compares it against the original inventory, and provides evidence for fair deposit negotiations and dispute resolution.
          </p>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-brand-dark-blue font-helvetica">Fair Deposit Protection</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our comprehensive check-out reports compare the end-of-tenancy condition against the original inventory, identifying any changes, damage, or cleaning requirements.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Detailed evidence supports fair deposit negotiations and provides clarity for all parties in potential disputes.
              </p>
            </div>
            <div className="relative">
              <Image 
                src="/stock_images/clean_empty_kitchen_1910f773.jpg"
                alt="Clean kitchen check-out inspection"
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
              'Side-by-side condition comparison',
              'Damage and change documentation',
              'Cleaning assessments',
              'High-resolution photographs',
              'Meter readings',
              'Key hand-back records',
              'Deposit dispute essentials'
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
              title="Precise & Impartial"
              description="Unbiased comparisons ensuring fairness for all parties"
            />
            <ReasonCard 
              icon={<FiFileText className="w-12 h-12 text-brand-light-blue" />}
              title="Evidence-Based Reporting"
              description="Detailed documentation with photographic proof"
            />
            <ReasonCard 
              icon={<FiClipboard className="w-12 h-12 text-brand-light-blue" />}
              title="Dispute Resolution Ready"
              description="Trusted by agents for deposit dispute clarity"
            />
            <ReasonCard 
              icon={<FiCamera className="w-12 h-12 text-brand-light-blue" />}
              title="Professional Photography"
              description="High-quality images documenting every detail"
            />
            <ReasonCard 
              icon={<FiCheckCircle className="w-12 h-12 text-brand-light-blue" />}
              title="Fast Turnaround"
              description="Quick delivery when you need it most"
            />
            <ReasonCard 
              icon={<FiShield className="w-12 h-12 text-brand-light-blue" />}
              title="Nationwide Coverage"
              description="Consistent quality across the UK"
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
              <p className="text-gray-600">Professional end-of-tenancy reporting for smooth deposit negotiations</p>
            </Link>
            <Link href="/property-managers" className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group">
              <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">Property Managers</h3>
              <p className="text-gray-600">Portfolio-wide check-out services with consistent standards</p>
            </Link>
            <Link href="/landlords" className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group">
              <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">Landlords</h3>
              <p className="text-gray-600">Protect your deposit with independent, evidence-based inspections</p>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-helvetica">Ready to Book Your Check-Out Inspection?</h2>
          <p className="text-xl mb-8 opacity-95">Get professional end-of-tenancy documentation for fair deposit resolution</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/booking"
              className="bg-white text-brand-dark-blue px-10 py-4 rounded-md font-bold hover:bg-gray-100 transition-all text-lg"
            >
              Book a Check-Out Inspection
            </Link>
            <Link
              href="/sample-documents"
              className="border-2 border-white text-white px-10 py-4 rounded-md font-bold hover:bg-white hover:text-brand-dark-blue transition-all text-lg"
            >
              View Sample Reports
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
