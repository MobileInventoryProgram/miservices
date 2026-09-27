'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiAlertCircle, FiEdit2, FiEye, FiPlus, FiPrinter, FiStar, FiUsers, FiX } from 'react-icons/fi';
import PageHeader from '@/components/members/PageHeader';
import Pagination from '@/components/members/Pagination';
import { usePagedList } from '@/components/members/usePagedList';
import { CARD_PAGE_SIZE } from '@/lib/pagination';

import type { AdminPriceListSummary } from '@/lib/sanity';

/** Franchises shown per page in the franchisee price lists section */
const FRANCHISES_PER_PAGE = 8;

const inputClass =
  'px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';

/** Name a new standard list and start it blank or as a copy, then open the editor */
function NewStandardListPanel({ lists, onClose }: { lists: AdminPriceListSummary[]; onClose: () => void }) {
  const router = useRouter();
  const standard = lists.filter((l) => l.isTemplate);
  const franchise = lists.filter((l) => !l.isTemplate);
  const [title, setTitle] = useState('');
  const [copyFromId, setCopyFromId] = useState(standard.find((l) => l.isDefault)?._id || standard[0]?._id || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, copyFromId: copyFromId || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to create price list');
        setSaving(false);
        return;
      }
      router.push(`/members/pricing/admin/${data.id}/edit`);
    } catch {
      setError('An error occurred. Please try again.');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={create} className="mb-6 rounded-lg border border-brand-light-blue/40 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 font-helvetica">New standard price list</h3>
        <button type="button" onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-700" aria-label="Close">
          <FiX className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="newListTitle" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            id="newListTitle"
            autoFocus
            required
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Standard Pricing 2027"
            className={`${inputClass} w-full`}
          />
        </div>
        <div>
          <label htmlFor="newListFrom" className="block text-sm font-medium text-gray-700 mb-1">
            Start from
          </label>
          <select id="newListFrom" value={copyFromId} onChange={(e) => setCopyFromId(e.target.value)} className={`${inputClass} w-full`}>
            <option value="">A blank list</option>
            {standard.length > 0 && (
              <optgroup label="Copy a standard list">
                {standard.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.title}
                  </option>
                ))}
              </optgroup>
            )}
            {franchise.length > 0 && (
              <optgroup label="Copy a franchise's list">
                {franchise.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.title} ({l.ownerTerritory || l.ownerName})
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>
      {error && (
        <p className="mt-3 flex items-center gap-2 text-sm text-red-700" role="alert">
          <FiAlertCircle className="flex-shrink-0" /> {error}
        </p>
      )}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-light-blue rounded-md hover:bg-brand-dark-blue disabled:opacity-50 transition-colors font-helvetica"
        >
          <FiPlus className="w-4 h-4" />
          {saving ? 'Creating…' : 'Create and edit'}
        </button>
        <span className="text-xs text-gray-500">New lists aren&apos;t shared with franchisees until you switch that on.</span>
      </div>
    </form>
  );
}

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
  const [creating, setCreating] = useState(false);
  const territoryPage = usePagedList(territories, FRANCHISES_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader width="5xl"
        title="Pricing"
        intro={
          <>
            Head Office — {templates.length} standard {templates.length === 1 ? 'list' : 'lists'}, {franchiseeLists.length} franchise {franchiseeLists.length === 1 ? 'list' : 'lists'}
          </>
        }
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Head Office standard lists */}
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900 font-helvetica">Standard Price Lists</h2>
              <p className="text-sm text-gray-500">Head Office lists. Shared lists can be viewed, quoted from and copied by franchisees.</p>
            </div>
            {!creating && (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-light-blue rounded-md hover:bg-brand-dark-blue transition-colors font-helvetica"
              >
                <FiPlus className="w-4 h-4" />
                New standard price list
              </button>
            )}
          </div>
          {creating && <NewStandardListPanel lists={[...templates, ...franchiseeLists]} onClose={() => setCreating(false)} />}
          {templates.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No standard price lists yet.</p>
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
                  <h3 className="text-base font-semibold text-gray-900 font-helvetica mb-2">
                    {template.title}
                  </h3>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {template.isDefault && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                        <FiStar className="w-3 h-3" />
                        Default
                      </span>
                    )}
                    {template.availableToFranchisees ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 rounded-full border border-green-200">
                        <FiUsers className="w-3 h-3" />
                        Shared with franchisees
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                        Head Office only
                      </span>
                    )}
                  </div>
                  <div className="mt-auto pt-3 border-t border-gray-100 flex gap-2">
                    <Link
                      href={`/members/pricing/admin/${template._id}/edit`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-brand-light-blue rounded-md hover:bg-brand-dark-blue transition-colors"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                    <Link
                      href={`/members/pricing/${template._id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <FiEye className="w-3.5 h-3.5" />
                      View
                    </Link>
                    <Link
                      href={`/members/pricing/${template._id}/leaflet`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <FiPrinter className="w-3.5 h-3.5" />
                      Leaflet
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Pagination {...templatePage} noun="lists" onPageChange={templatePage.setPage} hideSinglePage />
            </div>
            </>
          )}
        </section>

        {/* Franchisee Price Lists */}
        <section>
          <div ref={territoryPage.topRef} className="mb-4 flex scroll-mt-24 flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-gray-900 font-helvetica">Franchise Price Lists</h2>
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
                        <div className="mt-auto flex items-center gap-2 pt-3 border-t border-gray-100">
                          <Link
                            href={`/members/pricing/${list._id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                          >
                            <FiEye className="w-3.5 h-3.5" />
                            View
                          </Link>
                          <Link
                            href={`/members/pricing/${list._id}/leaflet`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                          >
                            <FiPrinter className="w-3.5 h-3.5" />
                            Leaflet
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
