import React from 'react';
import { Metadata } from 'next';
import { buildMetadata, getPageDoc } from '@/lib/cms/site';
import type { CmsHero, CmsSeo } from '@/lib/cms/types';
import BookingForm from '@/components/forms/BookingForm';

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getPageDoc<{ hero?: CmsHero; seo?: CmsSeo }>('bookingPage');
  return buildMetadata(doc?.seo, { title: doc?.hero?.heading, description: doc?.hero?.subheading, path: '/booking' });
}

export default async function BookingPage() {
  const doc = await getPageDoc<{ hero?: CmsHero }>('bookingPage');
  return (
    <>
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
          <p className="text-xl text-white opacity-90 max-w-3xl mx-auto">
            {doc?.hero?.subheading}
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <BookingForm />
        </div>
      </section>
    </>
  );
}
