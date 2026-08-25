import React from 'react';
import { Metadata } from 'next';
import ContactForm from '@/components/forms/ContactForm';
import BookingPromptModal from '@/components/ui/BookingPromptModal';
import { FiPhone, FiMapPin, FiFileText } from 'react-icons/fi';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobileinventoryservices.co.uk';

export const metadata: Metadata = {
  title: 'Contact miServices | Speak With Our Team',
  description: 'Get in touch with miServices for quotes, support, job bookings and general enquiries. Fast response and nationwide coverage.',
  openGraph: {
    title: 'Contact miServices | Speak With Our Team',
    description: 'Get in touch with miServices for quotes, support, job bookings and general enquiries. Fast response and nationwide coverage.',
    url: `${BASE_URL}/contact`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact miServices | Speak With Our Team',
    description: 'Get in touch with miServices for quotes, support, job bookings and general enquiries.',
  },
  alternates: {
    canonical: `${BASE_URL}/contact`,
  },
};

export default function ContactPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact miServices',
    description: 'Get in touch with miServices for quotes, support, job bookings and general enquiries.',
    url: `${BASE_URL}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: 'miServices',
      telephone: '0345 680 7976',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Third Floor, Suit A3 (3), Steam Mill, 3 Steam Mill St',
        addressLocality: 'Chester',
        postalCode: 'CH3 5AN',
        addressCountry: 'GB',
      },
    },
  };

  return (
    <>
      <BookingPromptModal />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="relative bg-gradient-to-br from-brand-dark-blue to-brand-light-blue py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" fill="none">
            <path
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
              fill="white"
            />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-helvetica">
            Contact miServices
          </h1>
          <p className="text-xl text-white opacity-90 max-w-2xl mx-auto">
            We're here to help with any enquiry — get in touch with our team.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-helvetica font-bold text-brand-dark-blue mb-6">
                  Get In Touch
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-brand-light-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                        <FiPhone className="w-6 h-6 text-brand-light-blue" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-helvetica font-semibold text-gray-900 mb-1">
                        Phone
                      </h3>
                      <a
                        href="tel:03456807976"
                        className="text-brand-light-blue hover:underline text-lg"
                      >
                        0345 680 7976
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-brand-light-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                        <FiMapPin className="w-6 h-6 text-brand-light-blue" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-helvetica font-semibold text-gray-900 mb-1">
                        Address
                      </h3>
                      <address className="text-gray-700 not-italic leading-relaxed">
                        Third Floor<br />
                        Suit A3 (3)<br />
                        Steam Mill<br />
                        3 Steam Mill St<br />
                        Chester<br />
                        CH3 5AN
                      </address>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-brand-light-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                        <FiFileText className="w-6 h-6 text-brand-light-blue" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-helvetica font-semibold text-gray-900 mb-1">
                        Company Number
                      </h3>
                      <p className="text-gray-700">07884266</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 italic">
                    Fill out the form and our team will get back to you as soon as possible.
                  </p>
                </div>
              </div>

              <div className="bg-brand-dark-blue rounded-lg shadow-lg p-8 text-white">
                <h3 className="text-xl font-helvetica font-bold mb-3">
                  Need to Book a Job?
                </h3>
                <p className="text-white opacity-90 mb-4">
                  If you're ready to schedule a property inspection, use our dedicated booking form for faster service.
                </p>
                <a
                  href="/booking"
                  className="inline-block bg-white text-brand-dark-blue px-6 py-3 rounded-lg font-helvetica font-semibold hover:bg-opacity-90 transition-all"
                >
                  Go to Booking Form
                </a>
              </div>
            </div>

            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
