import Link from 'next/link';
import Image from 'next/image';
import { FiCheckCircle, FiMapPin, FiUsers, FiFileText, FiClipboard, FiHome, FiClock, FiAward, FiShield } from 'react-icons/fi';
import AnimatedStats from '../components/AnimatedStats';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-dark-blue font-helvetica leading-tight">
                We are the trusted nationwide inventory clerk network
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
                Mobile Inventory Services (miServices) helps letting agents, landlords and property managers meet short deadlines with seamless inventory report delivery using innovative tech
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/contact"
                  className="bg-brand-light-blue text-white px-8 py-3 rounded-md font-medium hover:bg-brand-dark-blue transition-all text-center"
                >
                  Enquire Now
                </Link>
                <Link
                  href="/our-network"
                  className="border-2 border-brand-light-blue text-brand-light-blue px-8 py-3 rounded-md font-medium hover:bg-brand-light-blue hover:text-white transition-all text-center"
                >
                  Find Your Nearest Operative
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative h-[400px] lg:h-[500px] rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src="/stock_images/modern_luxury_kitche_2302410a.jpg"
                  alt="Modern Kitchen Interior"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
              <svg 
                className="absolute -left-32 lg:-left-64 top-0 w-[600px] h-full -z-10" 
                viewBox="0 0 600 500" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <path 
                  d="M 0 0 Q 150 250 0 500 L 600 500 L 600 0 Z" 
                  fill="#3f59a9" 
                  opacity="0.15"
                />
                <path 
                  d="M 50 0 Q 200 250 50 500 L 650 500 L 650 0 Z" 
                  fill="#157ec3" 
                  opacity="0.1"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <AnimatedStats />

      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-brand-dark-blue font-helvetica">
            Why Choose miServices
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue">
              <div className="w-16 h-16 bg-brand-light-blue/10 rounded-full flex items-center justify-center mb-6">
                <FiAward className="w-8 h-8 text-brand-light-blue" />
              </div>
              <h3 className="text-2xl font-bold text-brand-dark-blue mb-4 font-helvetica">Quality Assured</h3>
              <p className="text-gray-600 leading-relaxed">
                Every inspection meets our rigorous quality standards with comprehensive photography and detailed documentation.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-dark-blue">
              <div className="w-16 h-16 bg-brand-dark-blue/10 rounded-full flex items-center justify-center mb-6">
                <FiMapPin className="w-8 h-8 text-brand-dark-blue" />
              </div>
              <h3 className="text-2xl font-bold text-brand-dark-blue mb-4 font-helvetica">Nationwide Coverage</h3>
              <p className="text-gray-600 leading-relaxed">
                Our extensive network of 60+ franchise locations covers every corner of the UK with local expertise.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue">
              <div className="w-16 h-16 bg-brand-light-blue/10 rounded-full flex items-center justify-center mb-6">
                <FiClock className="w-8 h-8 text-brand-light-blue" />
              </div>
              <h3 className="text-2xl font-bold text-brand-dark-blue mb-4 font-helvetica">Fast Turnaround</h3>
              <p className="text-gray-600 leading-relaxed">
                Professional reports delivered promptly to meet your deadlines with innovative technology solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-5">
          <svg viewBox="0 0 200 500" fill="none" className="w-full h-full">
            <path d="M 200 0 Q 100 125 200 250 Q 100 375 200 500 L 0 500 L 0 0 Z" fill="#3f59a9"/>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-brand-dark-blue font-helvetica">
            Our Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard
              icon={<FiFileText className="w-12 h-12 text-brand-light-blue" />}
              title="Inventory Reports"
              description="Comprehensive property inventory documentation with detailed photography and descriptions."
              link="/inventory-reports"
            />
            <ServiceCard
              icon={<FiCheckCircle className="w-12 h-12 text-brand-light-blue" />}
              title="Check-in Services"
              description="Professional property check-in services ensuring smooth tenant move-ins."
              link="/check-ins"
            />
            <ServiceCard
              icon={<FiCheckCircle className="w-12 h-12 text-brand-light-blue" />}
              title="Check-out Services"
              description="Detailed check-out inspections to protect your property investment."
              link="/check-outs"
            />
            <ServiceCard
              icon={<FiMapPin className="w-12 h-12 text-brand-light-blue" />}
              title="Property Visits"
              description="Regular property inspections to maintain standards and identify issues early."
              link="/property-visits"
            />
            <ServiceCard
              icon={<FiHome className="w-12 h-12 text-brand-light-blue" />}
              title="Block Management"
              description="Comprehensive block management services for multi-unit properties."
              link="/block-management"
            />
            <ServiceCard
              icon={<FiClipboard className="w-12 h-12 text-brand-light-blue" />}
              title="Sample Documents"
              description="View our professional sample reports and documentation."
              link="/sample-documents"
            />
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-brand-dark-blue font-helvetica">
            Trusted by Leading Property Companies
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            We work with some of the UK's most respected lettings agents and property management companies
          </p>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4">
              <div className="p-8 flex items-center justify-center border-r border-b md:border-b-0 border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="relative w-40 h-20">
                  <Image
                    src="/client_logos/countrywide.png"
                    alt="Countrywide"
                    fill
                    sizes="160px"
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="p-8 flex items-center justify-center border-r md:border-r border-b md:border-b-0 border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="relative w-40 h-20">
                  <Image
                    src="/client_logos/openrent.png"
                    alt="OpenRent"
                    fill
                    sizes="160px"
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="p-8 flex items-center justify-center border-r border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="relative w-40 h-20">
                  <Image
                    src="/client_logos/leaders.png"
                    alt="Leaders"
                    fill
                    sizes="160px"
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="p-8 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <div className="relative w-40 h-20">
                  <Image
                    src="/client_logos/martin-co.png"
                    alt="Martin & Co"
                    fill
                    sizes="160px"
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-64">
          <svg viewBox="0 0 1200 200" fill="none" className="w-full h-full" preserveAspectRatio="none">
            <path d="M 0 100 Q 300 50 600 100 Q 900 150 1200 100 L 1200 200 L 0 200 Z" fill="#3f59a9" opacity="0.05"/>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-brand-dark-blue font-helvetica">
            Who We Work With
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <ClientCard
              icon={<FiUsers className="w-12 h-12 text-brand-light-blue" />}
              title="Lettings Agents"
              description="Streamline your property management with our professional inspection services tailored for letting agencies."
              link="/lettings-agents"
            />
            <ClientCard
              icon={<FiShield className="w-12 h-12 text-brand-light-blue" />}
              title="Property Managers"
              description="Comprehensive property inspection solutions for your entire portfolio with consistent quality standards."
              link="/property-managers"
            />
            <ClientCard
              icon={<FiHome className="w-12 h-12 text-brand-light-blue" />}
              title="Landlords"
              description="Protect your investment with detailed property inspections and professional documentation."
              link="/landlords"
            />
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-brand-light-blue to-brand-dark-blue text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1200 800" fill="none" className="w-full h-full">
            <path d="M 0 400 Q 300 200 600 400 Q 900 600 1200 400 L 1200 800 L 0 800 Z" fill="white"/>
            <path d="M 0 500 Q 300 300 600 500 Q 900 700 1200 500 L 1200 800 L 0 800 Z" fill="white" opacity="0.5"/>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 font-helvetica">
              Build a Business in the UK Property Sector
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-95 leading-relaxed">
              Join our successful franchise network and become part of the UK's leading property inspection service. 
              Benefit from our established brand, proven business model, and comprehensive support system.
            </p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                <div className="text-4xl font-bold mb-2 font-helvetica">26</div>
                <div className="text-sm opacity-90">Successful Franchisees</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                <div className="text-4xl font-bold mb-2 font-helvetica">60+</div>
                <div className="text-sm opacity-90">Territories</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                <div className="text-4xl font-bold mb-2 font-helvetica">100%</div>
                <div className="text-sm opacity-90">Support & Training</div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-helvetica">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-95">
              Find your nearest operative or explore franchise opportunities
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/our-network"
                className="bg-white text-brand-dark-blue px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-all text-lg"
              >
                Find Your Nearest Operative
              </Link>
              <Link
                href="/franchise"
                className="border-2 border-white text-white px-8 py-3 rounded-md font-medium hover:bg-white hover:text-brand-dark-blue transition-all text-lg"
              >
                Explore Franchise Opportunities
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ icon, title, description, link }: { icon: React.ReactNode; title: string; description: string; link: string }) {
  return (
    <Link href={link} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all border-l-4 border-brand-light-blue group">
      <div className="mb-4 transform group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-brand-dark-blue font-helvetica">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </Link>
  );
}

function ClientCard({ icon, title, description, link }: { icon: React.ReactNode; title: string; description: string; link: string }) {
  return (
    <Link href={link} className="bg-gray-50 p-8 rounded-lg hover:shadow-lg transition-all border-t-4 border-brand-light-blue group">
      <div className="mb-4 transform group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </Link>
  );
}
