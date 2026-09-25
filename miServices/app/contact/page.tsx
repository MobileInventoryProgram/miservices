import React from 'react';
import { Metadata } from 'next';
import ContactForm from '@/components/forms/ContactForm';
import BookingPromptModal, { type BookingPrompt } from '@/components/ui/BookingPromptModal';
import { FiPhone, FiMapPin, FiFileText } from 'react-icons/fi';
import { BASE_URL, buildMetadata, getPageDoc, getSiteSettings, telHref } from '@/lib/cms/site';
import type { CmsHero, CmsLink, CmsSeo } from '@/lib/cms/types';

interface ContactPageDoc {
  hero?: CmsHero;
  detailsHeading?: string;
  formNote?: string;
  bookingCard?: { heading?: string; text?: string; button?: CmsLink };
  bookingPrompt?: BookingPrompt;
  seo?: CmsSeo;
}

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getPageDoc<ContactPageDoc>('contactPage');
  return buildMetadata(doc?.seo, { title: doc?.hero?.heading, description: doc?.hero?.subheading, path: '/contact' });
}

export default async function ContactPage() {
  const [doc, site] = await Promise.all([getPageDoc<ContactPageDoc>('contactPage'), getSiteSettings()]);
  const [town, postcode] = (site.address || []).slice(-2);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: doc?.seo?.metaTitle,
    description: doc?.seo?.metaDescription,
    url: `${BASE_URL}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: site.siteName,
      telephone: site.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: (site.address || []).slice(0, -2).join(', '),
        addressLocality: town,
        postalCode: postcode,
        addressCountry: 'GB',
      },
    },
  };

  return (
    <>
      <BookingPromptModal prompt={doc?.bookingPrompt} />
      
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
            {doc?.hero?.heading}
          </h1>
          <p className="text-xl text-white opacity-90 max-w-2xl mx-auto">
            {doc?.hero?.subheading}
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-helvetica font-bold text-brand-dark-blue mb-6">
                  {doc?.detailsHeading}
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
                      <a href={telHref(site.phone)} className="text-brand-light-blue hover:underline text-lg">
                        {site.phone}
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
                        {(site.address || []).map((line, i) => (
                          <span key={i}>
                            {line}
                            <br />
                          </span>
                        ))}
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
                      <p className="text-gray-700">{site.companyNumber}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 italic">
                    {doc?.formNote}
                  </p>
                </div>
              </div>

              <div className="bg-brand-dark-blue rounded-lg shadow-lg p-8 text-white">
                <h3 className="text-xl font-helvetica font-bold mb-3">
                  {doc?.bookingCard?.heading}
                </h3>
                <p className="text-white opacity-90 mb-4">
                  {doc?.bookingCard?.text}
                </p>
                {doc?.bookingCard?.button && (
                  <a
                    href={doc.bookingCard.button.href}
                    className="inline-block bg-white text-brand-dark-blue border-2 border-transparent px-6 py-3 rounded-lg font-helvetica font-semibold hover:bg-opacity-90 transition-all"
                  >
                    {doc.bookingCard.button.label}
                  </a>
                )}
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
