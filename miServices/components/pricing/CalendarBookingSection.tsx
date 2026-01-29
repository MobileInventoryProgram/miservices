'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import CalendarModal from '@/components/ui/CalendarModal';

export default function CalendarBookingSection() {
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <>
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
            <div className="w-16 h-16 bg-gradient-to-br from-[#3f59a9] to-[#157ec3] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <h2 className="text-3xl font-bold text-[#3f59a9] mb-4" style={{ fontFamily: 'Helvetica, sans-serif' }}>
              Prefer to Speak With Someone?
            </h2>
            
            <p className="text-lg text-gray-700 mb-8" style={{ fontFamily: 'Maitree, serif' }}>
              If you'd like to discuss pricing, availability or multiple branches, book a call with our team.
            </p>

            <Button onClick={() => setShowCalendar(true)}>
              Book a Call With Our Team
            </Button>
          </div>
        </div>
      </section>

      {showCalendar && (
        <CalendarModal isOpen={true} onClose={() => setShowCalendar(false)} />
      )}
    </>
  );
}
