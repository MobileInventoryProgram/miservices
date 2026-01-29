'use client';

import React from 'react';

interface PricingIntroProps {
  onBookCallClick: () => void;
}

export default function PricingIntro({ onBookCallClick }: PricingIntroProps) {
  const scrollToForm = () => {
    const formSection = document.getElementById('pricing-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <section className="relative bg-gradient-to-br from-[#3f59a9] to-[#157ec3] text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute bottom-0 left-0 w-full h-32" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="white"/>
          </svg>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Helvetica, sans-serif' }}>
              Request Our Pricing
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8" style={{ fontFamily: 'Maitree, serif' }}>
              Pricing varies by region, but our service quality doesn't. Request the correct price list for your area.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={scrollToForm}
                className="bg-white text-[#3f59a9] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg"
                style={{ fontFamily: 'Helvetica, sans-serif' }}
              >
                Request Pricing
              </button>
              <button
                onClick={onBookCallClick}
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#3f59a9] transition-all"
                style={{ fontFamily: 'Helvetica, sans-serif' }}
              >
                Book A Call
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
            <h2 className="text-3xl font-bold text-[#3f59a9] mb-6" style={{ fontFamily: 'Helvetica, sans-serif' }}>
              Why We Don't Display Fixed Prices Online
            </h2>
            
            <p className="text-lg text-gray-700 mb-6" style={{ fontFamily: 'Maitree, serif' }}>
              miServices operates in over 65 territories, each serving different towns, cities and postcode groups.
            </p>

            <div className="mb-6">
              <p className="text-lg font-semibold text-gray-800 mb-3" style={{ fontFamily: 'Helvetica, sans-serif' }}>
                Pricing varies due to:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ fontFamily: 'Maitree, serif' }}>
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-[#157ec3] rounded-full mr-3"></span>
                  Regional operating costs
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-[#157ec3] rounded-full mr-3"></span>
                  Travel distances
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-[#157ec3] rounded-full mr-3"></span>
                  Local demand
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-[#157ec3] rounded-full mr-3"></span>
                  Staffing levels
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-[#157ec3] rounded-full mr-3"></span>
                  Territory size
                </li>
              </ul>
            </div>

            <p className="text-lg text-gray-700 mb-4" style={{ fontFamily: 'Maitree, serif' }}>
              Every franchise follows the same high standard of reporting — but local pricing ensures fairness, accuracy and competitiveness.
            </p>

            <p className="text-lg text-gray-700" style={{ fontFamily: 'Maitree, serif' }}>
              When you request pricing, we will match you with your nearest office and send the price list directly to your inbox.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
