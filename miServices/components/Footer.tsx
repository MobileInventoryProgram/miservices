import Link from 'next/link';
import Image from 'next/image';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="mb-6">
              <Image
                src="/logo.png"
                alt="miServices Logo"
                width={180}
                height={60}
                className="brightness-0 invert"
              />
            </div>
            <p className="text-sm leading-relaxed mb-4">
              The UK's trusted nationwide inventory clerk network, providing professional property inspection services.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 font-helvetica">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/inventory-reports" className="hover:text-brand-light-blue transition-colors">
                  Inventory Reports
                </Link>
              </li>
              <li>
                <Link href="/check-ins" className="hover:text-brand-light-blue transition-colors">
                  Check-in Services
                </Link>
              </li>
              <li>
                <Link href="/check-outs" className="hover:text-brand-light-blue transition-colors">
                  Check-out Services
                </Link>
              </li>
              <li>
                <Link href="/property-visits" className="hover:text-brand-light-blue transition-colors">
                  Property Visits
                </Link>
              </li>
              <li>
                <Link href="/block-management" className="hover:text-brand-light-blue transition-colors">
                  Block Management
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 font-helvetica">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-brand-light-blue transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/our-network" className="hover:text-brand-light-blue transition-colors">
                  Our Network
                </Link>
              </li>
              <li>
                <Link href="/franchise" className="hover:text-brand-light-blue transition-colors">
                  Franchise Opportunities
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-brand-light-blue transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-brand-light-blue transition-colors">
                  News
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-light-blue transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 font-helvetica">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <FiPhone className="w-5 h-5 text-brand-light-blue flex-shrink-0 mt-0.5" />
                <a href="tel:08001234567" className="hover:text-brand-light-blue transition-colors">
                  0800 123 4567
                </a>
              </li>
              <li className="flex items-start gap-2">
                <FiMapPin className="w-5 h-5 text-brand-light-blue flex-shrink-0 mt-0.5" />
                <Link href="/our-network" className="hover:text-brand-light-blue transition-colors">
                  Nationwide Coverage
                </Link>
              </li>
              <li className="mt-4">
                <Link 
                  href="/contact" 
                  className="inline-block bg-brand-light-blue text-white px-6 py-2 rounded-md hover:bg-brand-dark-blue transition-colors font-helvetica font-semibold text-sm"
                >
                  Get in Touch
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 pb-4">
          <h3 className="text-white font-bold mb-4 font-helvetica">Property Inventory Services by Location</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm mb-8">
            {[
              { name: 'London Central', slug: 'london-central' },
              { name: 'London SE', slug: 'london-south-east' },
              { name: 'South Manchester', slug: 'south-manchester' },
              { name: 'Birmingham', slug: 'birmingham' },
              { name: 'Bristol', slug: 'bristol' },
              { name: 'Sheffield', slug: 'sheffield' },
              { name: 'West Yorkshire', slug: 'west-yorkshire' },
              { name: 'Brighton', slug: 'brighton' },
              { name: 'Glasgow Central', slug: 'glasgow-central' },
              { name: 'Essex', slug: 'essex' },
              { name: 'Reading', slug: 'reading' },
              { name: 'Lancashire', slug: 'lancashire' },
            ].map((location) => (
              <Link
                key={location.slug}
                href={`/our-network/${location.slug}`}
                className="text-gray-400 hover:text-brand-light-blue transition-colors"
              >
                {location.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} miServices. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy-policy" className="text-gray-400 hover:text-brand-light-blue transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-brand-light-blue transition-colors">
                Terms & Conditions
              </Link>
              <Link href="/members/login" className="text-gray-400 hover:text-brand-light-blue transition-colors">
                Franchise Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
