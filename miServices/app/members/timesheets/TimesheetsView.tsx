'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiAlertCircle, FiArrowLeft, FiDownload, FiRefreshCw, FiSearch } from 'react-icons/fi';
import Pagination from '@/components/members/Pagination';
import type { StaffSummary, TimesheetLine } from '@/lib/servicem8/timesheets';

const selectClass =
  'px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';

type Filters = { from: string; to: string; view: 'summary' | 'lines'; staff: string; q: string };

const money = (n: number) => n.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' });
const num = (n: number, dp = 0) => n.toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp });

/** ServiceM8 stamps are 'YYYY-MM-DD HH:MM:SS' in UK time: show them as written */
function shortDate(stamp: string | null) {
  if (!stamp) return '—';
  return new Date(`${stamp.slice(0, 10)}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}
const time = (stamp: string | null) => (stamp ? stamp.slice(11, 16) : '—');

function travel(minutes: number, miles: number) {
  if (!minutes && !miles) return '—';
  return `${num(minutes)} min · ${num(miles, 1)} mi`;
}

function CheckInRate({ rate }: { rate: number | null }) {
  if (rate === null) return <span className="text-gray-400">—</span>;
  const pct = Math.round(rate * 100);
  const tone = pct >= 80 ? 'bg-green-50 text-green-700' : pct >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700';
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>{pct}%</span>;
}

export default function TimesheetsView({
  filters,
  presets,
  error,
  summary,
  lines,
  paging,
  staffOptions,
  fetchedAt,
}: {
  filters: Filters;
  presets: { today: string; yearStart: string; lastMonth: string };
  error: string | null;
  summary: StaffSummary[];
  lines: TimesheetLine[];
  paging: { page: number; totalPages: number; total: number; start: number; end: number };
  staffOptions: { id: string; name: string }[];
  fetchedAt: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState(filters.q);

  // Filters live in the URL, so the server does the work and links can be shared
  const params = (next: Partial<Filters> & { page?: number } = {}) => {
    const merged = { ...filters, ...next };
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(merged)) {
      if (key !== 'page' && value && !(key === 'view' && value === 'summary')) search.set(key, String(value));
    }
    if (next.page && next.page > 1) search.set('page', String(next.page));
    return search.toString();
  };
  const href = (next: Partial<Filters> & { page?: number } = {}) => {
    const qs = params(next);
    return qs ? `${pathname}?${qs}` : pathname;
  };
  const apply = (next: Partial<Filters>) => startTransition(() => router.replace(href(next), { scroll: false }));

  useEffect(() => {
    if (query === filters.q) return;
    const timer = setTimeout(() => apply({ q: query }), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await fetch('/api/admin/timesheets/refresh', { method: 'POST' });
      startTransition(() => router.refresh());
    } finally {
      setRefreshing(false);
    }
  };

  const monthStart = `${presets.today.slice(0, 7)}-01`;
  const quickRanges = [
    { label: 'This month', from: monthStart, to: presets.today },
    { label: 'Last month', from: `${presets.lastMonth.slice(0, 7)}-01`, to: presets.lastMonth },
    { label: 'This year', from: presets.yearStart, to: presets.today },
  ];

  const totals = summary.reduce(
    (t, s) => ({
      hours: t.hours + s.hours,
      completed: t.completed + s.completedJobs,
      bookedOnly: t.bookedOnly + s.bookedOnly,
      value: t.value + s.valueCredited,
    }),
    { hours: 0, completed: 0, bookedOnly: 0, value: 0 }
  );

  const exportHref = `/api/admin/timesheets/export?${params()}${filters.view === 'summary' ? '&view=summary' : ''}`;
  const busy = pending || refreshing;
  const tab = (view: Filters['view'], label: string) => (
    <button
      type="button"
      onClick={() => apply({ view })}
      aria-pressed={filters.view === view}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        filters.view === view ? 'bg-white text-brand-dark-blue shadow-sm' : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/members" className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors">
            <FiArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-helvetica">Staff Timesheets</h1>
              <p className="mt-1 text-blue-200">
                Check-ins and completed jobs for every member of staff, live from ServiceM8
                {fetchedAt && (
                  <> · updated {new Date(fetchedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</>
                )}
              </p>
            </div>
            <div className="flex gap-2 self-start">
              <button
                type="button"
                onClick={refresh}
                disabled={busy}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-60"
              >
                <FiRefreshCw className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              {!error && (
                <a
                  href={exportHref}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-white text-brand-dark-blue hover:bg-blue-50 transition-colors font-helvetica"
                >
                  <FiDownload className="w-4 h-4" />
                  Download CSV
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          <div className="flex gap-3">
            <div>
              <label htmlFor="ts-from" className="block text-xs font-medium text-gray-500 mb-1">
                From
              </label>
              <input
                id="ts-from"
                type="date"
                value={filters.from}
                max={presets.today}
                onChange={(e) => e.target.value && apply({ from: e.target.value })}
                className={selectClass}
              />
            </div>
            <div>
              <label htmlFor="ts-to" className="block text-xs font-medium text-gray-500 mb-1">
                To
              </label>
              <input
                id="ts-to"
                type="date"
                value={filters.to}
                max={presets.today}
                onChange={(e) => e.target.value && apply({ to: e.target.value })}
                className={selectClass}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickRanges.map((r) => {
              const active = filters.from === r.from && filters.to === r.to;
              return (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => apply({ from: r.from, to: r.to })}
                  aria-pressed={active}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                    active ? 'border-brand-dark-blue bg-blue-50 text-brand-dark-blue' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
          <div className="lg:ml-auto flex flex-col sm:flex-row gap-3">
            <label htmlFor="ts-staff" className="sr-only">
              Staff
            </label>
            <select id="ts-staff" value={filters.staff} onChange={(e) => apply({ staff: e.target.value })} className={selectClass}>
              <option value="">All staff</option>
              {staffOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {filters.view === 'lines' && (
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                <label htmlFor="ts-search" className="sr-only">
                  Search job number
                </label>
                <input
                  id="ts-search"
                  type="search"
                  placeholder="Job number"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={`${selectClass} w-full sm:w-40 pl-9`}
                />
              </div>
            )}
          </div>
        </div>

        <div className="inline-flex rounded-lg bg-gray-100 p-1">
          {tab('summary', 'Summary by staff')}
          {tab('lines', 'Timesheet lines')}
        </div>

        {error ? (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <FiAlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        ) : filters.view === 'summary' ? (
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto transition-opacity ${busy ? 'opacity-60' : ''}`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                  <th scope="col" className="px-4 py-3 font-semibold">Staff</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">Jobs checked in</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">Completed jobs</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">No check-in</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Check-in rate</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">Hours on site</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Travel</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">Pressed Complete</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">Completed by others</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">Value credited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {summary.map((s) => (
                  <tr key={s.staffId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link href={href({ view: 'lines', staff: s.staffId })} className="font-medium text-brand-dark-blue hover:text-brand-light-blue">
                        {s.staffName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{num(s.jobsWorked)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{num(s.completedJobs)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{num(s.bookedOnly)}</td>
                    <td className="px-4 py-3">
                      <CheckInRate rate={s.checkInRate} />
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{num(s.hours, 1)}</td>
                    <td className="px-4 py-3 text-gray-700">{travel(s.travelMinutes, s.travelMiles)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{num(s.completionsPressed)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{num(s.completedByOther)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{money(s.valueCredited)}</td>
                  </tr>
                ))}
                {summary.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                      No check-ins or bookings in this date range.
                    </td>
                  </tr>
                )}
              </tbody>
              {summary.length > 1 && (
                <tfoot>
                  <tr className="border-t border-gray-200 bg-gray-50 font-semibold text-gray-900">
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3 text-right">{num(totals.completed)}</td>
                    <td className="px-4 py-3 text-right">{num(totals.bookedOnly)}</td>
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3 text-right">{num(totals.hours, 1)}</td>
                    <td className="px-4 py-3" colSpan={3} />
                    <td className="px-4 py-3 text-right">{money(totals.value)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        ) : (
          <>
            <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto transition-opacity ${busy ? 'opacity-60' : ''}`}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                    <th scope="col" className="px-4 py-3 font-semibold">Date</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Job</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Staff</th>
                    <th scope="col" className="px-4 py-3 font-semibold">On site</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-right">Hours</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Travel</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Job status</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Completed by</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-right">Value credited</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lines.map((l) => (
                    <tr key={l.key} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{shortDate(l.date)}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {l.jobNumber}
                        {l.postcode && <div className="text-xs font-normal text-gray-500">{l.postcode}</div>}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{l.staffName}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {l.source === 'Booked only' ? (
                          <span className="inline-block rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Booked only, no check-in</span>
                        ) : (
                          <>
                            {l.checkOut ? `${time(l.checkIn)}–${time(l.checkOut)}` : `From ${time(l.checkIn)}`}
                            {l.note && <div className="text-xs text-amber-700">{l.note}</div>}
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">{l.hours === null ? '—' : num(l.hours, 2)}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{travel(l.travelMinutes, l.travelMiles)}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {l.status}
                        {l.completedAt && <div className="text-xs text-gray-500">{shortDate(l.completedAt)}</div>}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {l.completedBy || '—'}
                        {l.completedByOther && <div className="text-xs text-amber-700">Not this person</div>}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">{l.valueCredited ? money(l.valueCredited) : '—'}</td>
                    </tr>
                  ))}
                  {lines.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                        No timesheet lines match these filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination {...paging} noun={paging.total === 1 ? 'line' : 'lines'} hrefFor={(page) => href({ page })} />
          </>
        )}

        <p className="text-xs text-gray-500 max-w-3xl">
          Each completed job is credited to whoever checked in to it in ServiceM8. If nobody checked in, it goes to whoever was booked on it,
          not whoever pressed Complete. When several people worked a job, its value is split equally between them. “Pressed Complete” counts jobs
          completed in this range by that person, whether or not they did the work.
        </p>
      </div>
    </div>
  );
}
