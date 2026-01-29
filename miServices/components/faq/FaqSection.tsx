'use client';

import React from 'react';
import FAQAccordion from '@/components/ui/FAQAccordion';

interface FAQ {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  title: string;
  faqs: FAQ[];
}

export default function FaqSection({ title, faqs }: FaqSectionProps) {
  return (
    <div className="mb-12">
      <h2 className="text-2xl md:text-3xl font-bold text-brand-dark-blue mb-6 font-helvetica">
        {title}
      </h2>
      <FAQAccordion faqs={faqs} />
    </div>
  );
}
