'use client';

import { useEffect, useMemo, type SyntheticEvent } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiEdit2, FiLock } from 'react-icons/fi';
import DocumentBody from '@/components/documents/DocumentBody';
import DocumentContents from '@/components/documents/DocumentContents';
import { buildOutline, type DocBlock } from '@/lib/documents/standard';
import type { SanityMemberDocument } from '@/lib/sanity';

interface DocumentViewProps {
  document: SanityMemberDocument;
  subcategory: string;
  subcategoryTitle: string;
  viewer: { name: string; email: string };
  /** Admins get an Edit button and see when unpublished changes are waiting */
  editHref?: string;
  hasDraft?: boolean;
}

/** Diagonal repeating watermark with the viewer's details */
function watermark(text: string): string {
  const safe = text.replace(/[<>&"]/g, '');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='240'><text x='20' y='140' transform='rotate(-24 210 120)' fill='%23233e8b' fill-opacity='0.07' font-family='Helvetica, Arial, sans-serif' font-size='15'>${safe}</text></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg).replace(/%2523/g, '%23')}")`;
}

/**
 * Internal document viewer: readable when logged in, with no download and
 * deterrents against copying and printing.
 */
export default function DocumentView({ document: doc, subcategory, subcategoryTitle, viewer, editHref, hasDraft }: DocumentViewProps) {
  const body = (doc.body || []) as DocBlock[];
  // Contents come from the headings, so they always match the document
  const { sections } = useMemo(() => buildOutline(body, !!doc.numberHeadings), [body, doc.numberHeadings]);

  // Block print and save shortcuts on this page
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && ['p', 's'].includes(e.key.toLowerCase())) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const stop = (e: SyntheticEvent) => e.preventDefault();
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-10 print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/members/documents/${subcategory}`}
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to {subcategoryTitle}
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-helvetica">{doc.title}</h1>
              {doc.publishedAt && (
                <p className="mt-2 text-blue-200 text-sm">
                  Updated{' '}
                  {new Date(doc.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
            {editHref && (
              <Link
                href={editHref}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-white text-brand-dark-blue hover:bg-blue-50 transition-colors font-helvetica"
              >
                <FiEdit2 className="w-4 h-4" />
                Edit
              </Link>
            )}
          </div>
          {hasDraft && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-md bg-amber-100 px-3 py-1.5 text-sm text-amber-900">
              Draft changes are waiting to be published.{' '}
              <Link href={editHref || '#'} className="font-medium underline">
                Open the editor
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Shown instead of the document if someone tries to print it */}
      <div className="hidden p-16 text-center print:block">
        <p className="text-xl font-bold">This document is not available to print.</p>
        <p className="mt-2">miServices internal documents can only be viewed in Franchise Login.</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 print:hidden">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          {sections.length > 1 && <DocumentContents sections={sections} />}

          <div className={sections.length > 1 ? '' : 'lg:col-span-2 max-w-4xl'}>
            {body.length > 0 ? (
              <article
                onCopy={stop}
                onCut={stop}
                onContextMenu={stop}
                onDragStart={stop}
                className="relative select-none rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-10"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-lg"
                  style={{ backgroundImage: watermark(`${viewer.name} · ${viewer.email} · ${date}`) }}
                />
                <div className="relative">
                  <DocumentBody body={body} numberHeadings={doc.numberHeadings} />
                </div>
              </article>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white py-16 text-center">
                <p className="text-gray-500">This document has no content yet.</p>
              </div>
            )}
            <p className="mt-4 flex items-center gap-1.5 text-xs text-gray-400">
              <FiLock className="h-3.5 w-3.5" />
              Internal miServices document — for viewing in Franchise Login only. Please do not share or copy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
