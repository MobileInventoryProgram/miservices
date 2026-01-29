'use client';

import React, { useState } from 'react';
import DocumentCard from '@/components/exampleDocs/DocumentCard';
import GatedFormModal from '@/components/exampleDocs/GatedFormModal';

type DocumentType = 'Inventory' | 'Check-Out' | 'Property Visit';

export default function SampleDocumentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentType>('Inventory');

  const handleViewSample = (docType: DocumentType) => {
    setSelectedDocument(docType);
    setIsModalOpen(true);
  };

  const documents = [
    {
      type: 'Inventory' as DocumentType,
      title: 'Inventory Report Sample',
      description: 'See a sample of our detailed, compliant inventory reports that meet industry standards and provide comprehensive property documentation.',
    },
    {
      type: 'Check-Out' as DocumentType,
      title: 'Check-Out Report Sample',
      description: 'Review a sample of our end-of-tenancy check-out documentation, highlighting property condition changes and deposit recommendations.',
    },
    {
      type: 'Property Visit' as DocumentType,
      title: 'Property Visit Report Sample',
      description: 'Explore our mid-tenancy property visit report format, designed to keep landlords informed about their property\'s condition.',
    },
  ];

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
            Sample Property Reports
          </h1>
          <p className="text-xl text-white opacity-90 max-w-3xl mx-auto">
            Preview the quality of our Inventory, Check-Out and Property Visit reports. See firsthand how our detailed documentation protects both landlords and tenants.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {documents.map((doc, index) => (
              <DocumentCard
                key={index}
                title={doc.title}
                description={doc.description}
                onViewSample={() => handleViewSample(doc.type)}
              />
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-br from-blue-50 to-gray-50 rounded-2xl p-8 md:p-12 text-center border border-blue-100">
            <h2 className="text-3xl font-bold text-brand-dark-blue mb-4 font-helvetica">
              Need Full Service Documentation?
            </h2>
            <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
              Our nationwide network of professional clerks delivers comprehensive, legally compliant property reports for landlords, letting agents, and property managers across the UK.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/booking"
                className="inline-block bg-brand-light-blue text-white px-8 py-4 rounded-lg font-helvetica font-semibold hover:bg-opacity-90 transition-all shadow-lg"
              >
                Book a Property Report
              </a>
              <a
                href="/contact"
                className="inline-block bg-white text-brand-dark-blue border-2 border-brand-dark-blue px-8 py-4 rounded-lg font-helvetica font-semibold hover:bg-gray-50 transition-all"
              >
                Contact Us for Pricing
              </a>
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
