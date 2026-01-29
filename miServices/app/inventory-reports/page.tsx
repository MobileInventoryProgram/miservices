import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { FiCheckCircle, FiCamera, FiClipboard, FiShield } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'Inventory Reports | Professional Property Documentation',
  description: 'Accurate, compliant inventory reports for landlords, agents & property managers. Fast turnaround & nationwide coverage.',
  keywords: 'inventory reports, property inventory, rental property inspection, move-in inspection, property documentation',
};

export default function InventoryReports() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-helvetica">Inventory Reports</h1>
          <p className="text-xl md:text-2xl max-w-3xl leading-relaxed opacity-95">
            Accurate, compliant inventory reports protect landlords, tenants, and agents at the start of every tenancy. miServices provides detailed, impartial inventories with high-resolution photography, condition ratings, and full digital documentation — all delivered fast by our nationwide network of trained clerks.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-brand-dark-blue font-helvetica">What Is an Inventory Report?</h2>
          <p className="text-lg text-gray-700 max-w-4xl leading-relaxed mb-12">
            An inventory report is a professional document that records the full condition and contents of a rental property before move-in. It provides evidence for deposit disputes, ensures transparency, and protects all parties by creating a legally recognised baseline.
          </p>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-brand-dark-blue font-helvetica">Professional Documentation</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our experienced clerks meticulously document every room, capturing the condition of walls, floors, fixtures, and furnishings with high-resolution photography.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Each inventory report provides a comprehensive baseline that protects all parties and ensures transparency throughout the tenancy.
              </p>
            </div>
            <div className="relative">
              <Image 
                src="/stock_images/modern_living_room_i_0f00951f.jpg"
                alt="Professional living room inventory inspection"
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
              'Full room-by-room condition assessment',
              'High-quality photos',
              'Keys and meter readings',
              'Fixtures, fittings, and appliances',
              'Smoke/CO alarm compliance',
              'Notes for maintenance or safety',
              'Digitally formatted and timestamped reports'
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
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">Why Choose miServices?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ReasonCard 
              icon={<FiShield className="w-12 h-12 text-brand-light-blue" />}
              title="Experienced Clerks"
              description="Trained professionals across the UK delivering consistent quality"
            />
            <ReasonCard 
              icon={<FiClipboard className="w-12 h-12 text-brand-light-blue" />}
              title="Deposit-Dispute Ready"
              description="Documentation that stands up to legal scrutiny"
            />
            <ReasonCard 
              icon={<FiCamera className="w-12 h-12 text-brand-light-blue" />}
              title="Fast Turnaround"
              description="Digital reports delivered quickly without compromising quality"
            />
            <ReasonCard 
              icon={<FiCheckCircle className="w-12 h-12 text-brand-light-blue" />}
              title="Consistent Reporting"
              description="Standardized quality across all properties and locations"
            />
            <ReasonCard 
              icon={<FiClipboard className="w-12 h-12 text-brand-light-blue" />}
              title="Digital Integration"
              description="Reports integrated through our miProgram system"
            />
            <ReasonCard 
              icon={<FiShield className="w-12 h-12 text-brand-light-blue" />}
              title="Trusted Partners"
              description="Relied upon by letting agents, property managers & landlords"
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
              <p className="text-gray-600">Streamline your portfolio management with professional inventory services</p>
            </Link>
            <Link href="/property-managers" className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group">
              <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">Property Managers</h3>
              <p className="text-gray-600">Portfolio-wide reporting with consistent quality standards</p>
            </Link>
            <Link href="/landlords" className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group">
              <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">Landlords</h3>
              <p className="text-gray-600">Protect your investment with detailed property documentation</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">Our Process</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <ProcessStep number="1" title="Book Online" description="Choose a convenient date and time for your property inspection" />
            <ProcessStep number="2" title="Clerk Attends" description="Our trained operative conducts a thorough property inspection" />
            <ProcessStep number="3" title="Quality Check" description="Report is produced and quality checked by our team" />
            <ProcessStep number="4" title="Report Delivered" description="Final digital report delivered quickly to your inbox" />
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-helvetica">Ready to Book Your Inventory Report?</h2>
          <p className="text-xl mb-8 opacity-95">Get professional, compliant documentation for your property today</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/booking"
              className="bg-white text-brand-dark-blue px-10 py-4 rounded-md font-bold hover:bg-gray-100 transition-all text-lg"
            >
              Book an Inventory Report Now
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

function ProcessStep({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-light-blue text-white font-bold text-2xl mb-4 font-helvetica">
        {number}
      </div>
      <h4 className="font-bold text-xl mb-3 text-brand-dark-blue font-helvetica">{title}</h4>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
