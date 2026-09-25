'use client';

import React, { useState } from 'react';
import PricingIntro, { type PricingIntroContent } from '@/components/pricing/PricingIntro';
import PricingRequestForm from '@/components/forms/PricingRequestForm';
import CalendarModal from '@/components/ui/CalendarModal';
import NetworkCTA from '@/components/pricing/NetworkCTA';

export interface PricingPageDoc extends PricingIntroContent {
  form?: { heading?: string; text?: string; note?: string };
  networkCta?: { heading?: string; text?: string; button?: { label: string; href: string } };
}

export default function PricingContent({ doc }: { doc: PricingPageDoc | null }) {
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <main>
      <PricingIntro onBookCallClick={() => setShowCalendar(true)} content={doc || {}} />

      <section id="pricing-form" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <PricingRequestForm heading={doc?.form?.heading} text={doc?.form?.text} note={doc?.form?.note} />
        </div>
      </section>

      <NetworkCTA heading={doc?.networkCta?.heading} text={doc?.networkCta?.text} button={doc?.networkCta?.button} />

      {showCalendar && (
        <CalendarModal isOpen={true} onClose={() => setShowCalendar(false)} />
      )}
    </main>
  );
}
