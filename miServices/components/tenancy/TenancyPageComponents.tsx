import React from 'react';

export function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg hover:shadow-lg transition-all">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-brand-dark-blue font-helvetica">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export function ReasonCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-all">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-brand-dark-blue font-helvetica">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export function ProcessStep({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-light-blue text-white font-bold text-2xl mb-4 font-helvetica">
        {number}
      </div>
      <h4 className="font-bold text-xl mb-3 text-brand-dark-blue font-helvetica">{title}</h4>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

export function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group border-b border-gray-200">
      <summary className="flex justify-between items-center py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <span className="font-semibold text-brand-dark-blue">{question}</span>
        <svg
          className="w-5 h-5 text-brand-light-blue flex-shrink-0 ml-4 transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="pb-4 text-gray-600 leading-relaxed">
        {answer}
      </div>
    </details>
  );
}
