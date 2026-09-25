'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Pagination from '@/components/members/Pagination';
import { usePagedList } from '@/components/members/usePagedList';
import { CARD_PAGE_SIZE } from '@/lib/pagination';
import { FiAlertCircle, FiArrowLeft, FiEdit2, FiEye, FiPlus, FiX } from 'react-icons/fi';
import type { SanityMemberDocument } from '@/lib/sanity';

type AdminDoc = { _id: string; title: string; slug: string; description?: string; _updatedAt: string };

interface SubcategoryDocumentsProps {
  subcategory: string;
  subcategoryTitle: string;
  documents: SanityMemberDocument[];
  /** Head Office only: documents with unpublished changes, never-published drafts, hidden documents */
  admin?: { draftIds: string[]; unpublished: AdminDoc[]; hidden: AdminDoc[] };
}

/** Name a new document, then open it in the editor */
function NewDocumentForm({ subcategory, onClose }: { subcategory: string; onClose: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch('/api/admin/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, subcategory }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || 'Failed to create the document');
      setBusy(false);
      return;
    }
    router.push(`/members/documents/${subcategory}/${data.slug}/edit`);
  };
  return (
    <form onSubmit={create} className="mb-6 rounded-lg border border-brand-light-blue/40 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 font-helvetica">New document</h2>
        <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700" aria-label="Close">
          <FiX className="h-4 w-4" />
        </button>
      </div>
      <label htmlFor="new-doc-title" className="mb-1 block text-sm font-medium text-gray-700">
        Title
      </label>
      <div className="flex flex-wrap gap-3">
        <input
          id="new-doc-title"
          autoFocus
          required
          maxLength={160}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="min-w-[16rem] flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue"
        />
        <button
          type="submit"
          disabled={busy || !title.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-light-blue rounded-md hover:bg-brand-dark-blue disabled:opacity-50"
        >
          <FiPlus className="h-4 w-4" /> {busy ? 'Creating…' : 'Create and edit'}
        </button>
      </div>
      {error && (
        <p className="mt-2 flex items-center gap-2 text-sm text-red-700" role="alert">
          <FiAlertCircle /> {error}
        </p>
      )}
      <p className="mt-2 text-xs text-gray-500">It stays a draft, only visible to Head Office, until you publish it.</p>
    </form>
  );
}

function AdminList({ title, docs, subcategory, note }: { title: string; docs: AdminDoc[]; subcategory: string; note: string }) {
  if (docs.length === 0) return null;
  return (
    <section className="mb-6 rounded-lg border border-amber-200 bg-amber-50/60 p-4">
      <h2 className="text-sm font-semibold text-amber-900">
        {title} <span className="font-normal">— {note}</span>
      </h2>
      <ul className="mt-2 divide-y divide-amber-100">
        {docs.map((doc) => (
          <li key={doc._id} className="flex items-center justify-between gap-3 py-2">
            <span className="text-sm text-gray-900">{doc.title}</span>
            <Link
              href={`/members/documents/${subcategory}/${doc.slug}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-brand-light-blue rounded-md hover:bg-brand-dark-blue"
            >
              <FiEdit2 className="h-3.5 w-3.5" /> Edit
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function SubcategoryDocuments({
  subcategory,
  subcategoryTitle,
  documents,
  admin,
}: SubcategoryDocumentsProps) {
  const docPage = usePagedList(documents, CARD_PAGE_SIZE);
  const [creating, setCreating] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/members/documents"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Documents
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-helvetica">
                {subcategoryTitle}
              </h1>
              <p className="mt-1 text-blue-200">
                {documents.length} {documents.length === 1 ? 'document' : 'documents'}
              </p>
            </div>
            {admin && !creating && (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-white text-brand-dark-blue hover:bg-blue-50 transition-colors font-helvetica"
              >
                <FiPlus className="w-4 h-4" />
                New document
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {admin && creating && <NewDocumentForm subcategory={subcategory} onClose={() => setCreating(false)} />}
        {admin && (
          <>
            <AdminList title="Not published yet" note="only Head Office can see these" docs={admin.unpublished} subcategory={subcategory} />
            <AdminList title="Hidden from members" note="published, with Visible to members switched off" docs={admin.hidden} subcategory={subcategory} />
          </>
        )}
        {documents.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No documents in this subcategory yet.</p>
            <Link
              href="/members/documents"
              className="mt-4 inline-flex items-center gap-2 text-brand-light-blue hover:text-brand-dark-blue"
            >
              <FiArrowLeft className="w-4 h-4" />
              Return to Documents
            </Link>
          </div>
        ) : (
          <div ref={docPage.topRef} className="space-y-4 scroll-mt-24">
            {docPage.items.map((doc) => (
              <div
                key={doc._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 font-helvetica">
                    {doc.title}
                    {admin?.draftIds.includes(doc._id) && (
                      <span className="ml-2 align-middle rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">Draft changes</span>
                    )}
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
                  {admin && (
                    <Link
                      href={`/members/documents/${subcategory}/${doc.slug}/edit`}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-light-blue rounded-md hover:bg-brand-dark-blue transition-colors"
                    >
                      <FiEdit2 className="w-4 h-4" />
                      Edit
                    </Link>
                  )}
                  {doc.body && doc.body.length > 0 && (
                    <Link
                      href={`/members/documents/${subcategory}/${doc.slug}`}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-dark-blue bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <FiEye className="w-4 h-4" />
                      View
                    </Link>
                  )}
                </div>
              </div>
            ))}
            <Pagination {...docPage} noun="documents" onPageChange={docPage.setPage} hideSinglePage />
          </div>
        )}
      </div>
    </div>
  );
}
