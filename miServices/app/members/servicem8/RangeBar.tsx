'use client';

import { Suspense, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FiClock, FiRefreshCw } from 'react-icons/fi';
import { SNAPSHOT_TABS } from './tabs';

const inputClass =
  'px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';

type Preset = { label: string; from: string; to: string };

/** Date range for every tab (kept in the address) and Refresh from ServiceM8 */
export default function RangeBar(props: { today: string; presets: Preset[] }) {
  return (
    <Suspense fallback={<div className="h-[62px]" />}>
      <Bar {...props} />
    </Suspense>
  );
}

function Bar({ today, presets }: { today: string; presets: Preset[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [refreshing, setRefreshing] = useState(false);

  const from = searchParams.get('from') || presets[0].from;
  const to = searchParams.get('to') || presets[0].to;
  const snapshot = SNAPSHOT_TABS.some((t) => pathname === t || pathname.startsWith(`${t}/`));

  const apply = (next: { from: string; to: string }) => {
    const q = new URLSearchParams(searchParams.toString());
    q.set('from', next.from);
    q.set('to', next.to);
    q.delete('page');
    startTransition(() => router.replace(`${pathname}?${q.toString()}`, { scroll: false }));
  };

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
              <input id="sm8-from" type="date" value={from} max={today} onChange={(e) => e.target.value && apply({ from: e.target.value, to })} className={inputClass} />
            </div>
            <div>
              <label htmlFor="sm8-to" className="mb-1 block text-xs font-medium text-gray-500">
                To
              </label>
              <input id="sm8-to" type="date" value={to} max={today} onChange={(e) => e.target.value && apply({ from, to: e.target.value })} className={inputClass} />
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
      <button
        type="button"
        onClick={refresh}
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 self-start rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 lg:ml-auto lg:self-auto"
      >
        <FiRefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} aria-hidden="true" />
        {busy ? 'Loading…' : 'Refresh from ServiceM8'}
      </button>
    </div>
  );
}
