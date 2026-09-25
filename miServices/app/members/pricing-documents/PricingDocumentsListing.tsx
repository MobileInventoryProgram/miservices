'use client';

import Link from 'next/link';
import Pagination from '@/components/members/Pagination';
import { usePagedList } from '@/components/members/usePagedList';
import { CARD_PAGE_SIZE } from '@/lib/pagination';
import { FiArrowLeft, FiFileText, FiStar } from 'react-icons/fi';
import LeafletActions from './LeafletActions';

/** Stable empty list so paging doesn't reset on every render */
const NO_LISTS: LeafletListItem[] = [];

export interface LeafletListItem {
  _id: string;
  title: string;
  isDefault: boolean;
  shareToken: string | null;
  canTurnOffLink: boolean;
}

interface PricingDocumentsListingProps {
  ownedLists?: LeafletListItem[];
  sharedLists: LeafletListItem[];
  sharedHeading: string;
}

function LeafletCard({ list, badge }: { list: LeafletListItem; badge?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="bg-brand-dark-blue text-white p-2 rounded-md flex-shrink-0">
            <FiFileText className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 font-helvetica">{list.title}</h3>
        </div>
        {badge}
      </div>
      <div className="mt-auto pt-3 border-t border-gray-100">
        <LeafletActions
          listId={list._id}
          shareToken={list.shareToken}
          canTurnOffLink={list.canTurnOffLink}
        />
      </div>
    </div>
  );
}

export default function PricingDocumentsListing({
  ownedLists,
  sharedLists,
  sharedHeading,
  text = {},
}: PricingDocumentsListingProps & { text?: { heading?: string; intro?: string; introAdmin?: string; empty?: string } }) {
  const ownedPage = usePagedList(ownedLists || NO_LISTS, CARD_PAGE_SIZE);
  const sharedPage = usePagedList(sharedLists, CARD_PAGE_SIZE);
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
          <h1 className="text-3xl md:text-4xl font-bold font-helvetica">{text.heading}</h1>
          <p className="mt-1 text-blue-200">
            {text.intro}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {ownedLists && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 font-helvetica mb-4">My Price Lists</h2>
            {ownedLists.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <p className="text-gray-500 mb-4">
                  {text.empty}
                </p>
                <Link
                  href="/members/pricing"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-dark-blue bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Go to My Pricing
                </Link>
              </div>
            ) : (
              <div ref={ownedPage.topRef} className="grid scroll-mt-24 grid-cols-1 md:grid-cols-2 gap-4">
                {ownedPage.items.map((list) => (
                  <LeafletCard
                    key={list._id}
                    list={list}
                    badge={
                      list.isDefault && (
                        <span className="inline-flex flex-shrink-0 items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                          <FiStar className="w-3 h-3" />
                          Default
                        </span>
                      )
                    }
                  />
                ))}
              </div>
            )}
            <div className="mt-4">
              <Pagination {...ownedPage} noun="price lists" onPageChange={ownedPage.setPage} hideSinglePage />
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold text-gray-900 font-helvetica mb-4">{sharedHeading}</h2>
          {sharedLists.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No shared price lists available.</p>
            </div>
          ) : (
            <div ref={sharedPage.topRef} className="grid scroll-mt-24 grid-cols-1 md:grid-cols-2 gap-4">
              {sharedPage.items.map((list) => (
                <LeafletCard
                  key={list._id}
                  list={list}
                  badge={
                    <span className="inline-flex flex-shrink-0 items-center px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                      Template
                    </span>
                  }
                />
              ))}
            </div>
          )}
          <div className="mt-4">
            <Pagination {...sharedPage} noun="price lists" onPageChange={sharedPage.setPage} hideSinglePage />
          </div>
        </section>

        <p className="text-xs text-gray-400">All prices exclude VAT at the prevailing rate.</p>
      </div>
    </div>
  );
}
