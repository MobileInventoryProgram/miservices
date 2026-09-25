'use client';

import React, { useState } from 'react';
import DocumentCard from '@/components/exampleDocs/DocumentCard';
import GatedFormModal from '@/components/exampleDocs/GatedFormModal';

import type { CmsCta, CmsHero } from '@/lib/cms/types';

export interface SampleDocumentsPageDoc {
  hero?: CmsHero;
  documents?: { _key?: string; name: string; title?: string; description?: string }[];
  cta?: CmsCta;
}

export default function SampleDocumentsContent({ page }: { page: SampleDocumentsPageDoc | null }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState('');

  const handleViewSample = (docType: string) => {
    setSelectedDocument(docType);
    setIsModalOpen(true);
  };

  const documents = page?.documents || [];

  return (
    <>
      <section className="relative bg-gradient-to-br from-brand-dark-blue to-brand-light-blue py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute top-0 left-0 w-full" viewBox="0 0 1440 120" fill="none" transform="scale(1, -1)">
            <path
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
              fill="white"
            />
          </svg>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-helvetica">
            {page?.hero?.heading}
          </h1>
          <p className="text-xl text-white opacity-90 max-w-3xl mx-auto">
            {page?.hero?.subheading}
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {documents.map((doc, index) => (
              <DocumentCard
                key={doc._key || index}
                title={doc.title || ''}
                description={doc.description || ''}
                onViewSample={() => handleViewSample(doc.name)}
              />
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-br from-blue-50 to-gray-50 rounded-2xl p-8 md:p-12 text-center border border-blue-100">
            <h2 className="text-3xl font-bold text-brand-dark-blue mb-4 font-helvetica">
              {page?.cta?.heading}
            </h2>
            <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
              {page?.cta?.text}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {page?.cta?.primaryButton && (
                <a
                  href={page.cta.primaryButton.href}
                  className="inline-block bg-brand-light-blue text-white border-2 border-transparent px-8 py-4 rounded-lg font-helvetica font-semibold hover:bg-opacity-90 transition-all shadow-lg"
                >
                  {page.cta.primaryButton.label}
                </a>
              )}
              {page?.cta?.secondaryButton && (
                <a
                  href={page.cta.secondaryButton.href}
                  className="inline-block bg-white text-brand-dark-blue border-2 border-brand-dark-blue px-8 py-4 rounded-lg font-helvetica font-semibold hover:bg-gray-50 transition-all"
                >
                  {page.cta.secondaryButton.label}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <GatedFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        documentType={selectedDocument}
      />
    </>
  );
}
