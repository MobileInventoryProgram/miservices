import React from 'react';
import Image from 'next/image';
import { RichText } from '@/components/cms/Sections';

export default function AboutIntro({ heading, text, imageSrc, imageAlt }: { heading?: string; text?: unknown[]; imageSrc?: string; imageAlt?: string }) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-6 font-helvetica">
              {heading}
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <RichText value={text} paragraphClass="" />
            </div>
          </div>
          
          <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
            {imageSrc && <Image
              src={imageSrc}
              alt={imageAlt || ''}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />}
          </div>
        </div>
      </div>
    </section>
  );
}
