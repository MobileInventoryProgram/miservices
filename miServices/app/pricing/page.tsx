'use client';

import React, { useState } from 'react';
import PricingIntro from '@/components/pricing/PricingIntro';
import PricingRequestForm from '@/components/forms/PricingRequestForm';
import CalendarModal from '@/components/ui/CalendarModal';
import NetworkCTA from '@/components/pricing/NetworkCTA';

export default function PricingPage() {
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <main>
      <PricingIntro onBookCallClick={() => setShowCalendar(true)} />

      <section id="pricing-form" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <PricingRequestForm />
        </div>
      </section>

      <NetworkCTA />

      {showCalendar && (
        <CalendarModal isOpen={true} onClose={() => setShowCalendar(false)} />
      )}
    </main>
  );
}
