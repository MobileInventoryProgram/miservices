'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiBookOpen, FiFileText, FiPlus, FiSearch } from 'react-icons/fi';
import { effectiveStatus, QUOTE_STATUSES, quoteClientName, type Quote } from '@/lib/quote/types';
import QuoteStatusBadge from './QuoteStatusBadge';

const selectClass =
  'px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';

function shortDate(value?: string) {
  return value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
}

export default function QuotesListing({
  quotes,
  isAdmin,
  canCreate,
  guideCount,
}: {
  quotes: Quote[];
  isAdmin: boolean;
  canCreate: boolean;
  guideCount: number;
}) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [franchise, setFranchise] = useState('');

  const franchises = useMemo(() => {
    const seen = new Map<string, string>();
    quotes.forEach((q) => seen.set(q.franchise._id, q.franchise.companyName || 'Unknown'));
    return Array.from(seen, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [quotes]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return quotes
      .map((quote) => ({ quote, status: effectiveStatus(quote) }))
      .filter(({ quote, status: s }) => {
        if (status && s !== status) return false;
        if (franchise && quote.franchise._id !== franchise) return false;
        if (!q) return true;
        return [quote.reference, quoteClientName(quote), quote.contact?.companyName, quote.contact?.email]
          .filter(Boolean)
          .some((f) => f!.toLowerCase().includes(q));
      });
  }, [quotes, query, status, franchise]);

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
                href="/members/quoting/new"
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
          <select id="quote-status" value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
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
              <select id="quote-franchise" value={franchise} onChange={(e) => setFranchise(e.target.value)} className={selectClass}>
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

        {quotes.length === 0 ? (
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
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
                {rows.map(({ quote, status: s }) => (
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
                      <QuoteStatusBadge status={s} />
                    </td>
                    <td className="px-4 py-3 text-gray-700">{shortDate(quote.sentAt)}</td>
                    {isAdmin && <td className="px-4 py-3 text-gray-700">{quote.franchise.companyName || '—'}</td>}
                    <td className="px-4 py-3 text-gray-700">{quote.ownerName || '—'}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
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

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
          <span>
            {rows.length} of {quotes.length} {quotes.length === 1 ? 'quote' : 'quotes'}
          </span>
          {guideCount > 0 && (
            <Link href="/members/quoting/guides" className="inline-flex items-center gap-1.5 text-brand-light-blue hover:text-brand-dark-blue">
              <FiBookOpen className="w-3.5 h-3.5" />
              Quoting guides &amp; templates ({guideCount})
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
