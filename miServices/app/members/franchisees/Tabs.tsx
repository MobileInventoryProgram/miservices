'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Tabs under a Franchisees page header; the longest matching tab is highlighted */
export default function Tabs({ tabs, label }: { tabs: { href: string; label: string; badge?: string | number | null }[]; label: string }) {
  const pathname = usePathname();
  const active = tabs
    .filter((t) => pathname === t.href || pathname.startsWith(`${t.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav aria-label={label} className="-mb-6 mt-5 flex gap-1 overflow-x-auto">
      {tabs.map((t) => {
        const current = t.href === active;
        return (
          <Link
            key={t.href}
            href={t.href}
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

export const FRANCHISEES_TABS = [
  { href: '/members/franchisees', label: 'Franchisees' },
  { href: '/members/franchisees/compliance', label: 'Compliance' },
];
