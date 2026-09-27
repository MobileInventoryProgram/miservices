'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiEdit2, FiPlus } from 'react-icons/fi';
import { CmsIcon } from '@/lib/cms/icons';
import type { DocumentSection } from '@/lib/sanity';
import SectionForm from './SectionForm';

interface SubcategoryCardsProps {
  subcategoryCounts: Record<string, number>;
  sections: DocumentSection[];
  heading?: string;
  intro?: string;
  /** Head Office: add and edit sections */
  isAdmin?: boolean;
}

/** The Documents sections (from the CMS) with how many documents each has */
export default function SubcategoryCards({ subcategoryCounts, sections, heading, intro, isAdmin = false }: SubcategoryCardsProps) {
  // 'new', a section id being edited, or nothing
  const [editing, setEditing] = useState<string | null>(null);
  const editingSection = sections.find((s) => s._id === editing);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/members" className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors">
            <FiArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-helvetica">{heading}</h1>
              <p className="mt-1 text-blue-200">{intro}</p>
            </div>
            {isAdmin && editing !== 'new' && (
              <button
                type="button"
                onClick={() => setEditing('new')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-white text-brand-dark-blue hover:bg-blue-50 transition-colors font-helvetica"
              >
                <FiPlus className="w-4 h-4" />
                New section
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isAdmin && editing === 'new' && <SectionForm onClose={() => setEditing(null)} />}
        {isAdmin && editingSection && <SectionForm key={editingSection._id} section={editingSection} onClose={() => setEditing(null)} />}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {sections.map((sub) => {
            const count = subcategoryCounts[sub.slug] || 0;
            return (
              <div key={sub.slug} className="relative">
                <Link
                  href={`/members/documents/${sub.slug}`}
                  className={`group block h-full bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all ${isAdmin ? 'pr-14' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`${sub.colour || 'bg-blue-500'} text-white p-3 rounded-lg flex-shrink-0`}>
                      <CmsIcon name={sub.icon} className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-brand-dark-blue transition-colors font-helvetica">{sub.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{sub.description}</p>
                      <p className="text-sm text-gray-400 mt-2">
                        {count} {count === 1 ? 'document' : 'documents'}
                        {isAdmin && count === 0 && <span className="text-amber-600"> · hidden from franchisees until it has a document</span>}
                      </p>
                    </div>
                  </div>
                </Link>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setEditing(sub._id)}
                    className="absolute right-3 top-3 p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-brand-dark-blue transition-colors"
                    aria-label={`Edit ${sub.title}`}
                    title="Edit section"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
