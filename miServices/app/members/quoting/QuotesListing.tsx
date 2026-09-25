'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiArrowLeft, FiBookOpen, FiFileText, FiPlus, FiSearch, FiX } from 'react-icons/fi';
import Pagination from '@/components/members/Pagination';
import { effectiveStatus, QUOTE_STATUSES, quoteClientName, type Quote } from '@/lib/quote/types';
import QuoteStatusBadge from './QuoteStatusBadge';

const selectClass =
  'px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';

function shortDate(value?: string) {
  return value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
}

type Filters = { q: string; status: string; franchise: string; contact: string };

export default function QuotesListing({
  quotes,
  paging,
  filters,
  contactLabel,
  isAdmin,
  canCreate,
  franchises,
  guideCount,
}: {
  quotes: Quote[];
  paging: { page: number; totalPages: number; total: number; start: number; end: number };
  filters: Filters;
  contactLabel: string | null;
  isAdmin: boolean;
  canCreate: boolean;
  franchises: { id: string; name: string }[];
  guideCount: number;
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

  useEffect(() => {
    if (query === filters.q) return;
    const timer = setTimeout(() => apply({ q: query }), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const hasFilters = !!(filters.q || filters.status || filters.franchise || filters.contact);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/members/pricing-quoting" className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors">
            <FiArrowLeft className="w-4 h-4" />
            Back to Pricing &amp; Quoting
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-helvetica">Quotes</h1>
              <p className="mt-1 text-blue-200">{isAdmin ? 'Quotes across all franchises' : 'Bespoke quotes for your clients'}</p>
            </div>
            {canCreate && (
              <Link
                href={filters.contact ? `/members/quoting/new?contactId=${filters.contact}` : '/members/quoting/new'}
                className="inline-flex items-center gap-2 self-start px-4 py-2 text-sm font-medium rounded-md bg-white text-brand-dark-blue hover:bg-blue-50 transition-colors font-helvetica"
              >
                <FiPlus className="w-4 h-4" />
                New Quote
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        {filters.contact && (
          <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm text-brand-dark-blue">
            Quotes for <strong>{contactLabel || 'this client'}</strong>
            <Link href={href({ contact: '', page: 1 })} className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900">
              <FiX className="h-3.5 w-3.5" /> Show all
            </Link>
          </p>
        )}

        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <label htmlFor="quote-search" className="sr-only">
              Search quotes
            </label>
            <input
              id="quote-search"
              type="search"
              placeholder="Search reference, client or company"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`${selectClass} w-full pl-9`}
            />
          </div>
          <label htmlFor="quote-status" className="sr-only">
            Status
          </label>
          <select id="quote-status" value={filters.status} onChange={(e) => apply({ status: e.target.value })} className={selectClass}>
            <option value="">All statuses</option>
            {QUOTE_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          {isAdmin && (
            <>
              <label htmlFor="quote-franchise" className="sr-only">
                Franchise
              </label>
              <select id="quote-franchise" value={filters.franchise} onChange={(e) => apply({ franchise: e.target.value })} className={selectClass}>
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

        {paging.total === 0 && !hasFilters ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-10 text-center">
            <FiFileText className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No quotes yet.</p>
            {canCreate && (
              <Link
                href="/members/quoting/new"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-dark-blue bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Create your first quote
              </Link>
            )}
          </div>
        ) : (
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto transition-opacity ${pending ? 'opacity-60' : ''}`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                  <th scope="col" className="px-4 py-3 font-semibold">Quote</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Client</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Price list</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Sent</th>
                  {isAdmin && <th scope="col" className="px-4 py-3 font-semibold">Franchise</th>}
                  <th scope="col" className="px-4 py-3 font-semibold">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotes.map((quote) => (
                  <tr key={quote._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/members/quoting/${quote._id}`} className="font-medium text-brand-dark-blue hover:text-brand-light-blue">
                        {quote.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {quoteClientName(quote)}
                      {quote.contact?.companyName && quote.contact.companyName !== quoteClientName(quote) && (
                        <div className="text-xs text-gray-500">{quote.contact.companyName}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{quote.priceListTitle || '—'}</td>
                    <td className="px-4 py-3">
                      <QuoteStatusBadge status={effectiveStatus(quote)} />
                    </td>
                    <td className="px-4 py-3 text-gray-700">{shortDate(quote.sentAt)}</td>
                    {isAdmin && <td className="px-4 py-3 text-gray-700">{quote.franchise.companyName || '—'}</td>}
                    <td className="px-4 py-3 text-gray-700">{quote.ownerName || '—'}</td>
                  </tr>
                ))}
                {quotes.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="px-4 py-8 text-center text-gray-500">
                      No quotes match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <Pagination {...paging} noun={paging.total === 1 ? 'quote' : 'quotes'} hrefFor={(page) => href({ page })} />

        {guideCount > 0 && (
          <div className="flex justify-end text-xs">
            <Link href="/members/quoting/guides" className="inline-flex items-center gap-1.5 text-brand-light-blue hover:text-brand-dark-blue">
              <FiBookOpen className="w-3.5 h-3.5" />
              Quoting guides &amp; templates ({guideCount})
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
