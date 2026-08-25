'use client';

import Link from 'next/link';
import { FiArrowLeft, FiDownload } from 'react-icons/fi';
import { PortableText } from '@portabletext/react';
import type { SanityMemberDocument } from '@/lib/sanity';

interface DocumentViewProps {
  document: SanityMemberDocument;
  category: string;
  categoryTitle: string;
}

export default function DocumentView({
  document: doc,
  category,
  categoryTitle,
}: DocumentViewProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/members/${category}`}
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to {categoryTitle}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold font-helvetica">
            {doc.title}
          </h1>
          {doc.publishedAt && (
            <p className="mt-2 text-blue-200 text-sm">
              {new Date(doc.publishedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {doc.file?.asset?.url && (
          <div className="mb-8">
            <a
              href={`${doc.file.asset.url}?dl=`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-brand-light-blue rounded-md hover:bg-brand-dark-blue transition-colors"
            >
              <FiDownload className="w-4 h-4" />
              Download Document
            </a>
          </div>
        )}

        {doc.body && doc.body.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 prose prose-gray max-w-none">
            <PortableText value={doc.body} />
          </div>
        )}

        {(!doc.body || doc.body.length === 0) && !doc.file?.asset?.url && (
          <div className="text-center py-16">
            <p className="text-gray-500">This document has no content yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
