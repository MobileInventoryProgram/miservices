import React from 'react';

export default function Hero({ heading, text }: { heading?: string; text?: string }) {
  return (
    <section className="relative bg-gradient-to-br from-brand-dark-blue to-brand-light-blue py-32 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" fill="none">
          <path
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            fill="white"
          />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 font-helvetica">
          {heading}
        </h1>
        <p className="text-xl md:text-2xl text-white opacity-95 max-w-4xl mx-auto leading-relaxed">
          {text}
        </p>
      </div>
    </section>
  );
}
