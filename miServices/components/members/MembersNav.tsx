'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { FiLogOut } from 'react-icons/fi';

const LINKS = [
  { href: '/members', label: 'Dashboard', match: (p: string) => p === '/members' || p === '/members/edit-profile' },
  { href: '/members/documents', label: 'Documents', match: (p: string) => p.startsWith('/members/documents') },
  {
    href: '/members/pricing-quoting',
    label: 'Pricing & Quoting',
    match: (p: string) => p.startsWith('/members/pricing') || p.startsWith('/members/quoting'),
  },
  { href: '/members/contacts', label: 'Contacts', match: (p: string) => p.startsWith('/members/contacts') },
  { href: '/members/assets', label: 'Assets', match: (p: string) => p.startsWith('/members/assets') },
];

/**
 * Top bar on every Franchise Login page: one click back to the dashboard or
 * any section, wherever you are.
 */
export default function MembersNav() {
  const pathname = usePathname();
  if (pathname.startsWith('/members/login')) return null;

  const link = (item: (typeof LINKS)[number]) => {
    const active = item.match(pathname);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          active ? 'bg-blue-50 text-brand-dark-blue' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <nav aria-label="Franchise Login" className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/members" className="flex flex-shrink-0 items-center gap-2" aria-label="Franchise Login dashboard">
          <img src="/logo.png" alt="" className="h-8 w-auto" />
          <span className="hidden font-bold text-brand-dark-blue font-helvetica sm:inline">Franchise Login</span>
        </Link>
        <div className="hidden flex-1 items-center gap-1 md:flex">{LINKS.map(link)}</div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/members/login' })}
          className="ml-auto inline-flex flex-shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 md:ml-0"
        >
          <FiLogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
      {/* Phones: section links scroll sideways under the bar */}
      <div className="flex gap-1 overflow-x-auto border-t border-gray-100 px-3 py-1.5 md:hidden">{LINKS.map(link)}</div>
    </nav>
  );
}
