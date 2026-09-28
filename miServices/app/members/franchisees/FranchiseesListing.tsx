'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FiPlus, FiSearch } from 'react-icons/fi';
import PageHeader, { headerPrimaryButton } from '@/components/members/PageHeader';
import Pagination from '@/components/members/Pagination';
import { usePagedList } from '@/components/members/usePagedList';
import type { FranchiseRow, FranchiseStatus } from '@/lib/franchisees/admin';
import { CONTRACT_STATE_STYLES, contractInfo, feeText, formatUkDate } from '@/lib/franchisees/contract';
import { TABLE_PAGE_SIZE } from '@/lib/pagination';
import FranchiseStatusBadge from './StatusBadge';
import Tabs from '@/components/members/Tabs';
import { FRANCHISEES_TABS } from './tabs';

const selectClass =
  'px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';

/** Head Office: every franchise, live, hidden while being set up, or deactivated */
type Filter = '' | FranchiseStatus | 'contracts';

export default function FranchiseesListing({ franchises, today, initialFilter = '' }: { franchises: FranchiseRow[]; today: string; initialFilter?: Filter }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Filter>(initialFilter);

  const rows = useMemo(
    () =>
      franchises.map((f) => {
        const info = contractInfo(f.contract, today);
        // Renewals and expiries only matter for franchises still trading
        const needsAction = !f.isHeadOffice && f.status !== 'inactive' && (info.state === 'renewalDue' || info.state === 'expired');
        return { ...f, info, needsAction };
      }),
    [franchises, today]
  );

  const counts = useMemo(() => {
    const c = { live: 0, hidden: 0, inactive: 0, renewalDue: 0, expired: 0 };
    rows.forEach((f) => {
      c[f.status]++;
      if (f.needsAction) c[f.info.state as 'renewalDue' | 'expired']++;
    });
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (f) =>
        (!status || (status === 'contracts' ? f.needsAction : f.status === status)) &&
        (!q || [f.companyName, f.territory, f.ownerName, f.ownerEmail, f.townsCities].some((v) => v.toLowerCase().includes(q)))
    );
  }, [franchises, query, status]);
  const page = usePagedList(filtered, TABLE_PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Franchisees"
        intro={[
          `${counts.live} live on Our Network · ${counts.hidden} hidden · ${counts.inactive} inactive`,
          counts.renewalDue && `${counts.renewalDue} contract${counts.renewalDue === 1 ? '' : 's'} due for renewal`,
          counts.expired && `${counts.expired} expired`,
        ]
          .filter(Boolean)
          .join(' · ')}
        actions={
          <Link href="/members/franchisees/new" className={headerPrimaryButton}>
            <FiPlus className="h-4 w-4" /> Add franchisee
          </Link>
        }
      >
        <Tabs tabs={FRANCHISEES_TABS} label="Franchisees sections" />
      </PageHeader>

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
          <select id="franchise-status" value={status} onChange={(e) => setStatus(e.target.value as Filter)} className={selectClass}>
            <option value="">All franchisees</option>
            <option value="live">Live on Our Network</option>
            <option value="hidden">Hidden (being set up)</option>
            <option value="inactive">Inactive</option>
            <option value="contracts">Renewal due or expired</option>
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
                <th scope="col" className="px-4 py-3 font-semibold">Contract</th>
                <th scope="col" className="px-4 py-3 font-semibold">Fee</th>
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
                  <td className="whitespace-nowrap px-4 py-3">
                    {f.isHeadOffice ? (
                      <span className="text-gray-400">—</span>
                    ) : (
                      <Link href={`/members/franchisees/${f._id}/contract`} className="group block">
                        {f.info.state === 'active' ? (
                          <span className="text-gray-700 group-hover:text-brand-light-blue">Expires {formatUkDate(f.info.expiry!)}</span>
                        ) : (
                          <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${CONTRACT_STATE_STYLES[f.info.state].className}`}>
                            {CONTRACT_STATE_STYLES[f.info.state].label}
                          </span>
                        )}
                        {(f.info.state === 'renewalDue' || f.info.state === 'expired') && (
                          <div className="mt-1 text-xs text-gray-500">{f.info.state === 'expired' ? 'Expired' : 'Expires'} {formatUkDate(f.info.expiry!)}</div>
                        )}
                      </Link>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">{f.isHeadOffice ? <span className="text-gray-400">—</span> : feeText(f.contract) || <span className="text-gray-400">Not set</span>}</td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {f.activeLogins}
                    {f.logins > f.activeLogins && <span className="text-xs text-gray-400"> (+{f.logins - f.activeLogins} off)</span>}
                  </td>
                </tr>
              ))}
              {page.items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
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
