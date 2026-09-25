'use client';

import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { CmsIcon } from '@/lib/cms/icons';
import type { DocumentSection } from '@/lib/sanity';


interface SubcategoryCardsProps {
  subcategoryCounts: Record<string, number>;
  sections: DocumentSection[];
  heading?: string;
  intro?: string;
}

/** The Documents sections (from the CMS) with how many documents each has */
export default function SubcategoryCards({ subcategoryCounts, sections, heading, intro }: SubcategoryCardsProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/members"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold font-helvetica">
            {heading}
          </h1>
          <p className="mt-1 text-blue-200">
            {intro}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {sections.map((sub) => {
            const count = subcategoryCounts[sub.slug] || 0;
            return (
              <Link
                key={sub.slug}
                href={`/members/documents/${sub.slug}`}
                className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`${sub.colour || 'bg-blue-500'} text-white p-3 rounded-lg flex-shrink-0`}
                  >
                    <CmsIcon name={sub.icon} className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-brand-dark-blue transition-colors font-helvetica">
                      {sub.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{sub.description}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {count} {count === 1 ? 'document' : 'documents'}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
