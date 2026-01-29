import React from 'react';
import Image from 'next/image';

export default function AboutIntro() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-6 font-helvetica">
              Welcome to miServices
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Welcome to miServices — a national network built on innovation, reliability, and a relentless commitment to raising industry standards. Since 2009, we've transformed traditional inventory management and property reporting into a modern, technology-driven service trusted by letting agents, property managers and landlords across the UK.
              </p>
              <p>
                What started as a simple idea to streamline inventory processes has grown into one of the UK's largest professional reporting networks, delivering thousands of high-quality reports every month.
              </p>
            </div>
          </div>
          
          <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
            <Image
              src="/stock_images/professional_propert_9156a3d3.jpg"
              alt="miServices professional office team"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
