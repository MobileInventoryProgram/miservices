'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiEye, FiStar } from 'react-icons/fi';
import Pagination from '@/components/members/Pagination';
import { usePagedList } from '@/components/members/usePagedList';
import { CARD_PAGE_SIZE } from '@/lib/pagination';

/** Franchises shown per page in the franchisee price lists section */
const FRANCHISES_PER_PAGE = 8;
import type { AdminPriceListSummary } from '@/lib/sanity';

interface AdminPricingViewProps {
  templates: AdminPriceListSummary[];
  franchiseeLists: AdminPriceListSummary[];
}

export default function AdminPricingView({
  templates,
  franchiseeLists,
}: AdminPricingViewProps) {
  // Group franchisee lists by territory
  const byTerritory: Record<string, AdminPriceListSummary[]> = {};
  for (const list of franchiseeLists) {
    const key = list.ownerTerritory || list.ownerName || 'Unknown';
    if (!byTerritory[key]) byTerritory[key] = [];
    byTerritory[key].push(list);
  }
  const allTerritories = Object.keys(byTerritory).sort();
  const [territoryFilter, setTerritoryFilter] = useState('');
  const territories = useMemo(
    () => (territoryFilter ? allTerritories.filter((t) => t === territoryFilter) : allTerritories),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [territoryFilter, franchiseeLists]
  );
  const templatePage = usePagedList(templates, CARD_PAGE_SIZE);
  const territoryPage = usePagedList(territories, FRANCHISES_PER_PAGE);

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
          <h1 className="text-3xl md:text-4xl font-bold font-helvetica">All Pricing</h1>
          <p className="mt-1 text-blue-200">
            Admin view — {templates.length} {templates.length === 1 ? 'template' : 'templates'}, {franchiseeLists.length} franchisee {franchiseeLists.length === 1 ? 'list' : 'lists'}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Admin Templates */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 font-helvetica mb-4">Admin Templates</h2>
          {templates.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No admin templates yet. Create them in Sanity Studio.</p>
            </div>
          ) : (
            <>
            <div ref={templatePage.topRef} className="scroll-mt-24" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templatePage.items.map((template) => (
                <div
                  key={template._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col"
                >
                  <h3 className="text-base font-semibold text-gray-900 font-helvetica mb-3">
                    {template.title}
                  </h3>
                  <div className="mt-auto pt-3 border-t border-gray-100">
                    <Link
                      href={`/members/pricing/${template._id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <FiEye className="w-3.5 h-3.5" />
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Pagination {...templatePage} noun="templates" onPageChange={templatePage.setPage} hideSinglePage />
            </div>
            </>
          )}
        </section>

        {/* Franchisee Price Lists */}
        <section>
          <div ref={territoryPage.topRef} className="mb-4 flex scroll-mt-24 flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-gray-900 font-helvetica">Franchisee Price Lists</h2>
            {allTerritories.length > 1 && (
              <>
                <label htmlFor="territory-filter" className="sr-only">
                  Franchise
                </label>
                <select
                  id="territory-filter"
                  value={territoryFilter}
                  onChange={(e) => setTerritoryFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue"
                >
                  <option value="">All franchises ({allTerritories.length})</option>
                  {allTerritories.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
          {territories.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No franchisee price lists yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {territoryPage.items.map((territory) => (
                <div key={territory}>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
                    {territory}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {byTerritory[territory].map((list) => (
                      <div
                        key={list._id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-base font-semibold text-gray-900 font-helvetica">
                            {list.title}
                          </h4>
                          {list.isDefault && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                              <FiStar className="w-3 h-3" />
                              Default
                            </span>
                          )}
                        </div>
                        {list.ownerName && (
                          <p className="text-xs text-gray-400 mb-3">{list.ownerName}</p>
                        )}
                        <div className="mt-auto pt-3 border-t border-gray-100">
                          <Link
                            href={`/members/pricing/${list._id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                          >
                            <FiEye className="w-3.5 h-3.5" />
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <Pagination {...territoryPage} noun="franchises" onPageChange={territoryPage.setPage} hideSinglePage />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
