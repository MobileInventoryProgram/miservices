'use client';

import { Suspense, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FiClock, FiRefreshCw, FiUser } from 'react-icons/fi';
import StaffPicker from './StaffPicker';
import { SNAPSHOT_TABS } from './tabs';

const inputClass = 'px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';

type Preset = { label: string; from: string; to: string };
type StaffOption = { id: string; name: string };

/** Date range and staff for every tab (kept in the address), and Refresh from ServiceM8 */
export default function RangeBar(props: { today: string; presets: Preset[]; staffOptions: StaffOption[] }) {
  return (
    <Suspense fallback={<div className="h-[62px]" />}>
      <Bar {...props} />
    </Suspense>
  );
}

function Bar({ today, presets, staffOptions = [] }: { today: string; presets: Preset[]; staffOptions?: StaffOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [refreshing, setRefreshing] = useState(false);

  const from = searchParams.get('from') || presets[0].from;
  const to = searchParams.get('to') || presets[0].to;
  const snapshot = SNAPSHOT_TABS.some((t) => pathname === t || pathname.startsWith(`${t}/`));
  const staff = (searchParams.get('staff') || '').split(',').filter(Boolean);
  const names = new Map(staffOptions.map((o) => [o.id, o.name]));

  const go = (changes: Record<string, string | null>) => {
    const q = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) q.set(k, v);
      else q.delete(k);
    }
    q.delete('page');
    startTransition(() => router.replace(`${pathname}?${q.toString()}`, { scroll: false }));
  };
  const apply = (next: { from: string; to: string }) => go({ from: next.from, to: next.to });

  const refresh = async () => {
    setRefreshing(true);
    try {
      await fetch('/api/admin/servicem8/refresh', { method: 'POST' });
      startTransition(() => router.refresh());
    } finally {
      setRefreshing(false);
    }
  };
  const busy = pending || refreshing;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        {snapshot ? (
          <p className="flex items-center gap-2 text-sm text-gray-600">
            <FiClock className="h-4 w-4 text-gray-400" aria-hidden="true" />
            Where things stand right now. The date range doesn’t apply to this tab.
          </p>
        ) : (
          <>
            <div className="flex gap-3">
              <div>
                <label htmlFor="sm8-from" className="mb-1 block text-xs font-medium text-gray-500">
                  From
                </label>
                <input
                  id="sm8-from"
                  type="date"
                  value={from}
                  max={today}
                  onChange={(e) => e.target.value && apply({ from: e.target.value, to })}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="sm8-to" className="mb-1 block text-xs font-medium text-gray-500">
                  To
                </label>
                <input
                  id="sm8-to"
                  type="date"
                  value={to}
                  max={today}
                  onChange={(e) => e.target.value && apply({ from, to: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => {
                const active = from === p.from && to === p.to;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => apply(p)}
                    aria-pressed={active}
                    className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                      active ? 'border-brand-dark-blue bg-blue-50 text-brand-dark-blue' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </>
        )}
        <div className="flex flex-col gap-3 sm:flex-row lg:ml-auto">
          <StaffPicker options={staffOptions} selected={staff} onApply={(ids) => go({ staff: ids.join(',') || null })} />
          <button
            type="button"
            onClick={refresh}
            disabled={busy}
            title="Pull the latest from ServiceM8"
          className="inline-flex items-center justify-center gap-2 self-start whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 sm:self-auto"
          >
            <FiRefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} aria-hidden="true" />
            {busy ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>
      {staff.length > 0 && (
        <p className="flex items-start gap-2 rounded-md bg-blue-50 px-3 py-2 text-sm text-brand-dark-blue">
          <FiUser className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>
            Showing jobs credited to <strong>{staff.map((id) => names.get(id) || 'someone no longer listed').join(', ')}</strong>: whoever checked in, or
            whoever was booked if nobody checked in. Jobs shared with others count in full.{' '}
            <button type="button" onClick={() => go({ staff: null })} className="font-medium underline hover:no-underline">
              Show everyone
            </button>
          </span>
        </p>
      )}
    </div>
  );
}
