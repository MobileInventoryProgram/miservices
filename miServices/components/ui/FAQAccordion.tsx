'use client';

import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQ[];
}

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
        >
          <button
            onClick={() => toggleFAQ(index)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-xl font-bold text-brand-dark-blue font-helvetica pr-4">
              {faq.question}
            </h3>
            {openIndex === index ? (
              <FiChevronUp className="w-6 h-6 text-brand-light-blue flex-shrink-0" />
            ) : (
              <FiChevronDown className="w-6 h-6 text-brand-light-blue flex-shrink-0" />
            )}
          </button>
          
          {openIndex === index && (
            <div className="px-6 pb-6 pt-0">
              <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
