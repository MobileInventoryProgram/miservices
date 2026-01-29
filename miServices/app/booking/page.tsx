import React from 'react';
import { Metadata } from 'next';
import BookingForm from '@/components/forms/BookingForm';

export const metadata: Metadata = {
  title: 'Book a Property Report | miServices',
  description: 'Book an inventory, check-in, check-out, mid-term inspection or block management visit with miServices. Fast scheduling and nationwide coverage.',
  openGraph: {
    title: 'Book a Property Report | miServices',
    description: 'Book an inventory, check-in, check-out, mid-term inspection or block management visit with miServices. Fast scheduling and nationwide coverage.',
    type: 'website',
  },
};

export default function BookingPage() {
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
            Book a Property Report
          </h1>
          <p className="text-xl text-white opacity-90 max-w-3xl mx-auto">
            Complete the form below to book your inventory, inspection or block management visit.
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
