'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export interface Tab {
  href: string;
  label: string;
  badge?: string | number | null;
  /** Only this exact path, not the pages under it */
  exact?: boolean;
}

/**
 * Tabs under a page header; the longest matching tab is highlighted.
 * `keepQuery` carries those query values (e.g. a date range) from tab to tab.
 */
export default function Tabs(props: { tabs: Tab[]; label: string; keepQuery?: string[] }) {
  // Reading the query needs a Suspense boundary; until then, plain links
  return (
    <Suspense fallback={<TabLinks {...props} keepQuery={[]} />}>
      <TabLinks {...props} />
    </Suspense>
  );
}

function TabLinks({ tabs, label, keepQuery = [] }: { tabs: Tab[]; label: string; keepQuery?: string[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const kept = new URLSearchParams();
  keepQuery.forEach((key) => {
    const value = searchParams.get(key);
    if (value) kept.set(key, value);
  });
  const query = kept.toString();
  const active = tabs
    .filter((t) => pathname === t.href || (!t.exact && pathname.startsWith(`${t.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav aria-label={label} className="-mb-6 mt-5 flex gap-1 overflow-x-auto">
      {tabs.map((t) => {
        const current = t.href === active;
        return (
          <Link
            key={t.href}
            href={query ? `${t.href}?${query}` : t.href}
            aria-current={current ? 'page' : undefined}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              current ? 'border-brand-dark-blue text-brand-dark-blue' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            {t.label}
            {t.badge ? <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{t.badge}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
