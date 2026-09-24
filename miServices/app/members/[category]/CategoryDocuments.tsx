'use client';

import Link from 'next/link';
import { FiArrowLeft, FiDownload, FiEye } from 'react-icons/fi';
import type { SanityMemberDocument } from '@/lib/sanity';

interface CategoryDocumentsProps {
  category: string;
  categoryTitle: string;
  documents: SanityMemberDocument[];
  backHref?: string;
  backLabel?: string;
}

export default function CategoryDocuments({
  category,
  categoryTitle,
  documents,
  backHref = '/members',
  backLabel = 'Dashboard',
}: CategoryDocumentsProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to {backLabel}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold font-helvetica">
            {categoryTitle}
          </h1>
          <p className="mt-1 text-blue-200">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {documents.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No documents in this category yet.</p>
            <Link
              href={backHref}
              className="mt-4 inline-flex items-center gap-2 text-brand-light-blue hover:text-brand-dark-blue"
            >
              <FiArrowLeft className="w-4 h-4" />
              Return to {backLabel}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 font-helvetica">
                    {doc.title}
                  </h3>
                  {doc.description && (
                    <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                  )}
                  {doc.publishedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(doc.publishedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {(doc.file?.asset?.url || (doc.body && doc.body.length > 0)) && (
                    <Link
                      href={`/members/${category}/${doc.slug}`}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-dark-blue bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <FiEye className="w-4 h-4" />
                      View
                    </Link>
                  )}
                  {doc.file?.asset?.url && (
                    <a
                      href={`${doc.file.asset.url}?dl=`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-light-blue rounded-md hover:bg-brand-dark-blue transition-colors"
                    >
                      <FiDownload className="w-4 h-4" />
                      Download
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
