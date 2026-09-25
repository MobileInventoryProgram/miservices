'use client';

import { useState } from 'react';
import Link from 'next/link';
import Pagination from '@/components/members/Pagination';
import { usePagedList } from '@/components/members/usePagedList';
import { CARD_PAGE_SIZE } from '@/lib/pagination';
import { useRouter } from 'next/navigation';
import {
  FiArrowLeft,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiStar,
  FiCopy,
} from 'react-icons/fi';
import type { SanityPriceListSummary } from '@/lib/sanity';

interface PricingListingProps {
  franchiseeId: string;
  territory: string;
  ownedLists: (SanityPriceListSummary & { isOwned: boolean })[];
  sharedTemplates: (SanityPriceListSummary & { isOwned: boolean })[];
}

export default function PricingListing({
  franchiseeId,
  territory,
  ownedLists,
  sharedTemplates,
}: PricingListingProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const ownedPage = usePagedList(ownedLists, CARD_PAGE_SIZE);
  const sharedPage = usePagedList(sharedTemplates, CARD_PAGE_SIZE);

  const handleDelete = async (listId: string) => {
    if (!confirm('Are you sure you want to delete this price list?')) return;

    setDeletingId(listId);
    setError('');

    try {
      const res = await fetch(`/api/members/pricing/${listId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to delete price list');
      } else {
        router.refresh();
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (listId: string) => {
    setSettingDefaultId(listId);
    setError('');

    try {
      const res = await fetch(`/api/members/pricing/${listId}/default`, {
        method: 'PATCH',
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to set default');
      } else {
        router.refresh();
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setSettingDefaultId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/members/pricing-quoting"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Pricing &amp; Quoting
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold font-helvetica">My Pricing</h1>
          <p className="mt-1 text-blue-200">{territory} territory</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* My Price Lists */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 font-helvetica">My Price Lists</h2>
            <Link
              href="/members/pricing/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-light-blue rounded-md hover:bg-brand-dark-blue transition-colors font-helvetica"
            >
              <FiPlus className="w-4 h-4" />
              Duplicate a Template
            </Link>
          </div>

          {ownedLists.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500 mb-4">
                You don&apos;t have any price lists yet. Duplicate a shared template to get started.
              </p>
              <Link
                href="/members/pricing/new"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-dark-blue bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
              >
                <FiCopy className="w-4 h-4" />
                Duplicate a Template
              </Link>
            </div>
          ) : (
            <>
            <div ref={ownedPage.topRef} className="scroll-mt-24" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ownedPage.items.map((list) => (
                <div
                  key={list._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-900 font-helvetica">
                      {list.title}
                    </h3>
                    {list.isDefault && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                        <FiStar className="w-3 h-3" />
                        Default
                      </span>
                    )}
                  </div>
                  <div className="mt-auto flex items-center gap-2 pt-3 border-t border-gray-100">
                    <Link
                      href={`/members/pricing/${list._id}/edit`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                    {!list.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(list._id)}
                        disabled={settingDefaultId === list._id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        <FiStar className="w-3.5 h-3.5" />
                        {settingDefaultId === list._id ? 'Setting...' : 'Set Default'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(list._id)}
                      disabled={deletingId === list._id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50 ml-auto"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                      {deletingId === list._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Pagination {...ownedPage} noun="price lists" onPageChange={ownedPage.setPage} hideSinglePage />
            </div>
            </>
          )}
        </section>

        {/* Shared Templates */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 font-helvetica mb-4">Shared Templates</h2>

          {sharedTemplates.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No shared templates available.</p>
            </div>
          ) : (
            <>
            <div ref={sharedPage.topRef} className="scroll-mt-24" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sharedPage.items.map((template) => (
                <div
                  key={template._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-900 font-helvetica">
                      {template.title}
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                      Template
                    </span>
                  </div>
                  <div className="mt-auto flex items-center gap-2 pt-3 border-t border-gray-100">
                    <Link
                      href={`/members/pricing/${template._id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <FiEye className="w-3.5 h-3.5" />
                      View
                    </Link>
                    <Link
                      href={`/members/pricing/new?templateId=${template._id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-dark-blue bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      <FiCopy className="w-3.5 h-3.5" />
                      Duplicate
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Pagination {...sharedPage} noun="templates" onPageChange={sharedPage.setPage} hideSinglePage />
            </div>
            </>
          )}
        </section>

        <p className="text-xs text-gray-400">All prices exclude VAT at the prevailing rate.</p>
      </div>
    </div>
  );
}
