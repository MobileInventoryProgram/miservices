'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Pagination from '@/components/members/Pagination';
import { FiArrowLeft, FiBookOpen, FiPlus, FiSearch, FiUsers } from 'react-icons/fi';
import { contactName, type Contact } from '@/lib/crm/types';
import { CONTACT_STATUSES, clientTypeLabel } from '@/lib/crm/options';
import { JOB_TYPES, jobTypeLabel } from '@/lib/job-types';
import StatusBadge from './StatusBadge';

const selectClass =
  'px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';

type Filters = { q: string; status: string; job: string; franchise: string };

export default function ContactsListing({
  contacts,
  paging,
  filters,
  isAdmin,
  canCreate,
  franchises,
  directoryCount,
}: {
  contacts: Contact[];
  paging: { page: number; totalPages: number; total: number; start: number; end: number };
  filters: Filters;
  isAdmin: boolean;
  canCreate: boolean;
  franchises: { id: string; name: string }[];
  directoryCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(filters.q);

  // Filters live in the URL, so the server searches and pages the full list
  const href = (next: Partial<Filters> & { page?: number }) => {
    const merged = { ...filters, ...next };
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(merged)) {
      if (key !== 'page' && value) params.set(key, String(value));
    }
    if (next.page && next.page > 1) params.set('page', String(next.page));
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };
  const apply = (next: Partial<Filters>) => startTransition(() => router.replace(href(next), { scroll: false }));

  // Search as you type, after a short pause
  useEffect(() => {
    if (query === filters.q) return;
    const timer = setTimeout(() => apply({ q: query }), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const hasFilters = !!(filters.q || filters.status || filters.job || filters.franchise);

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
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-helvetica">Contacts</h1>
              <p className="mt-1 text-blue-200">
                {isAdmin ? 'All franchise contacts' : 'Your clients and prospects'}
              </p>
            </div>
            {canCreate && (
              <Link
                href="/members/contacts/new"
                className="inline-flex items-center gap-2 self-start px-4 py-2 text-sm font-medium rounded-md bg-white text-brand-dark-blue hover:bg-blue-50 transition-colors font-helvetica"
              >
                <FiPlus className="w-4 h-4" />
                Add Contact
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <label htmlFor="contact-search" className="sr-only">
              Search contacts
            </label>
            <input
              id="contact-search"
              type="search"
              placeholder="Search name, company, email, phone or postcode"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`${selectClass} w-full pl-9`}
            />
          </div>
          <label className="sr-only" htmlFor="filter-status">
            Status
          </label>
          <select id="filter-status" value={filters.status} onChange={(e) => apply({ status: e.target.value })} className={selectClass}>
            <option value="">All statuses</option>
            {CONTACT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="filter-job">
            Job type
          </label>
          <select id="filter-job" value={filters.job} onChange={(e) => apply({ job: e.target.value })} className={selectClass}>
            <option value="">All job types</option>
            {JOB_TYPES.map((job) => (
              <option key={job.value} value={job.value}>
                {job.label}
              </option>
            ))}
          </select>
          {isAdmin && (
            <>
              <label className="sr-only" htmlFor="filter-franchise">
                Franchise
              </label>
              <select
                id="filter-franchise"
                value={filters.franchise}
                onChange={(e) => apply({ franchise: e.target.value })}
                className={selectClass}
              >
                <option value="">All franchises</option>
                {franchises.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        {/* Table */}
        {paging.total === 0 && !hasFilters ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-10 text-center">
            <FiUsers className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No contacts yet.</p>
            {canCreate && (
              <Link
                href="/members/contacts/new"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-dark-blue bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Add your first contact
              </Link>
            )}
          </div>
        ) : (
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto transition-opacity ${pending ? 'opacity-60' : ''}`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                  <th scope="col" className="px-4 py-3 font-semibold">Name</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Company</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">Properties</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Job types</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  {isAdmin && <th scope="col" className="px-4 py-3 font-semibold">Franchise</th>}
                  <th scope="col" className="px-4 py-3 font-semibold">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/members/contacts/${contact._id}`}
                        className="font-medium text-brand-dark-blue hover:text-brand-light-blue"
                      >
                        {contactName(contact)}
                      </Link>
                      {contact.email && <div className="text-xs text-gray-500">{contact.email}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {contact.companyName || '—'}
                      {contact.clientType && (
                        <div className="text-xs text-gray-500">{clientTypeLabel(contact.clientType)}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700">{contact.propertyCount ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {contact.jobTypes?.length ? contact.jobTypes.map(jobTypeLabel).join(', ') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={contact.status} />
                    </td>
                    {isAdmin && <td className="px-4 py-3 text-gray-700">{contact.franchiseName || '—'}</td>}
                    <td className="px-4 py-3 text-gray-700">{contact.ownerName || '—'}</td>
                  </tr>
                ))}
                {contacts.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="px-4 py-8 text-center text-gray-500">
                      No contacts match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <Pagination {...paging} noun={paging.total === 1 ? 'contact' : 'contacts'} hrefFor={(page) => href({ page })} />

        <div className="flex flex-wrap items-center justify-end gap-3 text-xs text-gray-500">
          {directoryCount > 0 && (
            <Link
              href="/members/contacts/directory"
              className="inline-flex items-center gap-1.5 text-brand-light-blue hover:text-brand-dark-blue"
            >
              <FiBookOpen className="w-3.5 h-3.5" />
              Key contacts &amp; directory documents ({directoryCount})
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
