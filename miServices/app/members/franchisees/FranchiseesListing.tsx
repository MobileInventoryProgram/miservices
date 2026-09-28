'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FiPlus, FiSearch } from 'react-icons/fi';
import PageHeader, { headerPrimaryButton } from '@/components/members/PageHeader';
import Pagination from '@/components/members/Pagination';
import { usePagedList } from '@/components/members/usePagedList';
import type { FranchiseRow, FranchiseStatus } from '@/lib/franchisees/admin';
import { TABLE_PAGE_SIZE } from '@/lib/pagination';
import FranchiseStatusBadge from './StatusBadge';

const selectClass =
  'px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';

/** Head Office: every franchise, live, hidden while being set up, or deactivated */
export default function FranchiseesListing({ franchises }: { franchises: FranchiseRow[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'' | FranchiseStatus>('');

  const counts = useMemo(() => {
    const c = { live: 0, hidden: 0, inactive: 0 };
    franchises.forEach((f) => c[f.status]++);
    return c;
  }, [franchises]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return franchises.filter(
      (f) =>
        (!status || f.status === status) &&
        (!q || [f.companyName, f.territory, f.ownerName, f.ownerEmail, f.townsCities].some((v) => v.toLowerCase().includes(q)))
    );
  }, [franchises, query, status]);
  const page = usePagedList(filtered, TABLE_PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Franchisees"
        intro={`${counts.live} live on Our Network · ${counts.hidden} hidden · ${counts.inactive} inactive`}
        actions={
          <Link href="/members/franchisees/new" className={headerPrimaryButton}>
            <FiPlus className="h-4 w-4" /> Add franchisee
          </Link>
        }
      />

      <div className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <label htmlFor="franchise-search" className="sr-only">
              Search franchisees
            </label>
            <input
              id="franchise-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, territory, owner or town"
              className={`${selectClass} w-full pl-9`}
            />
          </div>
          <label htmlFor="franchise-status" className="sr-only">
            Status
          </label>
          <select id="franchise-status" value={status} onChange={(e) => setStatus(e.target.value as '' | FranchiseStatus)} className={selectClass}>
            <option value="">All franchisees</option>
            <option value="live">Live on Our Network</option>
            <option value="hidden">Hidden (being set up)</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div ref={page.topRef} className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                <th scope="col" className="px-4 py-3 font-semibold">Franchise</th>
                <th scope="col" className="px-4 py-3 font-semibold">Owner</th>
                <th scope="col" className="px-4 py-3 font-semibold">Towns</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 font-semibold text-right">Logins</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {page.items.map((f) => (
                <tr key={f._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/members/franchisees/${f._id}`} className="font-medium text-brand-dark-blue hover:text-brand-light-blue">
                      {f.territory || f.companyName}
                    </Link>
                    <div className="text-xs text-gray-500">
                      {f.companyName}
                      {f.isHeadOffice && <span className="ml-1.5 rounded bg-blue-50 px-1.5 py-0.5 text-brand-dark-blue">Head Office</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {f.ownerName || '—'}
                    {f.ownerEmail && <div className="text-xs text-gray-500">{f.ownerEmail}</div>}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-gray-600">
                    <span className="line-clamp-2">{f.townsCities || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <FranchiseStatusBadge status={f.status} />
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {f.activeLogins}
                    {f.logins > f.activeLogins && <span className="text-xs text-gray-400"> (+{f.logins - f.activeLogins} off)</span>}
                  </td>
                </tr>
              ))}
              {page.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No franchisees match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination {...page} noun={page.total === 1 ? 'franchisee' : 'franchisees'} onPageChange={page.setPage} />
      </div>
    </div>
  );
}
