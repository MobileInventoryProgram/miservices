import { Metadata } from 'next';
import Link from 'next/link';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobileinventoryservices.co.uk';

export const metadata: Metadata = {
  title: 'Careers | miServices',
  description: 'Join the miServices team. Explore career opportunities in property inspection services across the UK.',
  openGraph: {
    title: 'Careers | miServices',
    description: 'Join the miServices team. Explore career opportunities in property inspection services.',
    url: `${BASE_URL}/careers`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Careers | miServices',
    description: 'Explore career opportunities in property inspection services.',
  },
  alternates: {
    canonical: `${BASE_URL}/careers`,
  },
};

export default function Careers() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-helvetica">Careers at miServices</h1>
          <p className="text-xl">Build your career in property inspection services</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
          <h2 className="text-3xl font-bold mb-6 text-brand-dark-blue font-helvetica">Why Work With Us?</h2>
          <p className="mb-6 text-lg">
            At miServices, we're always looking for talented professionals to join our growing team. 
            Whether you're interested in becoming a franchise partner or joining our corporate team, 
            we offer exciting opportunities for career growth.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-l-4 border-brand-light-blue pl-4">
              <h3 className="font-bold text-xl mb-2 font-helvetica">Franchise Opportunities</h3>
              <p className="text-gray-600 mb-3">Build your own property inspection business with our proven franchise model.</p>
              <Link href="/franchise" className="text-brand-light-blue hover:underline">Learn more →</Link>
            </div>
            <div className="border-l-4 border-brand-light-blue pl-4">
              <h3 className="font-bold text-xl mb-2 font-helvetica">Corporate Positions</h3>
              <p className="text-gray-600 mb-3">Join our head office team in various operational and support roles.</p>
              <Link href="/contact" className="text-brand-light-blue hover:underline">Contact us →</Link>
            </div>
          </div>
        </div>

        <div className="text-center bg-brand-light-blue text-white p-12 rounded-lg">
          <h2 className="text-3xl font-bold mb-4 font-helvetica">Ready to Join Us?</h2>
          <p className="text-xl mb-6">Get in touch to discuss career opportunities</p>
          <Link href="/contact" className="bg-white text-brand-light-blue px-8 py-3 rounded-md font-medium hover:bg-gray-100 inline-block">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
