import React from 'react';
import Link from 'next/link';

export default function NetworkCTA({ heading, text, button }: { heading?: string; text?: string; button?: { label: string; href: string } }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#3f59a9] to-[#157ec3] rounded-2xl overflow-hidden shadow-xl">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-8 md:p-12 flex flex-col justify-center text-white">
              <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Helvetica, sans-serif' }}>
                {heading}
              </h2>
              
              <p className="text-xl mb-8 text-white/90" style={{ fontFamily: 'Maitree, serif' }}>
                {text}
              </p>

              <div>
                {button && (
                  <Link href={button.href} className="inline-block bg-white text-[#3f59a9] border-2 border-transparent px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all">
                    {button.label}
                  </Link>
                )}
              </div>
            </div>

            <div className="relative h-64 md:h-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-[#157ec3]/20 to-transparent">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-48 h-48 text-white/10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
              </div>
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
