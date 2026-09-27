'use client';

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { FiLogOut, FiMenu, FiUser, FiX } from 'react-icons/fi';
import { activeHref, navFor } from './nav';

export interface ShellUser {
  name: string;
  /** Territory, or "Head Office" for admins without one */
  subtitle: string;
  photoUrl: string | null;
  isAdmin: boolean;
  /** Has a franchise profile they can edit */
  hasFranchisee: boolean;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?';
}

function Sidebar({ user, pathname, onNavigate }: { user: ShellUser; pathname: string; onNavigate?: () => void }) {
  const groups = navFor(user.isAdmin);
  const active = activeHref(pathname, groups);

  return (
    <div className="flex h-full flex-col bg-brand-dark-blue text-white">
      <Link href="/members" onClick={onNavigate} className="flex h-16 flex-shrink-0 items-center gap-3 border-b border-white/10 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white p-1">
          <img src="/logo.png" alt="" className="h-full w-auto" />
        </span>
        <span className="font-helvetica leading-tight">
          <span className="block text-sm text-blue-200">miServices</span>
          <span className="block font-bold">Members Area</span>
        </span>
      </Link>

      <nav aria-label="Members Area" className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((group, gi) => (
          <div key={group.label || gi} className={gi > 0 ? 'mt-6' : ''}>
            {group.label && <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-blue-200/80">{group.label}</p>}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = item.href === active;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={isActive ? 'page' : undefined}
                      className={`relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isActive ? 'bg-white/15 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-white" aria-hidden="true" />}
                      <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="flex-shrink-0 border-t border-white/10 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          {user.photoUrl ? (
            <img src={`${user.photoUrl}?w=80&h=80&fit=crop`} alt="" className="h-9 w-9 flex-shrink-0 rounded-full object-cover" />
          ) : (
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
              {initials(user.name)}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-blue-200">{user.subtitle}</p>
          </div>
        </div>
        <div className="mt-1 space-y-1">
          {user.hasFranchisee && (
            <Link
              href="/members/edit-profile"
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-blue-100 hover:bg-white/10 hover:text-white transition-colors"
            >
              <FiUser className="h-4 w-4" /> Edit profile
            </Link>
          )}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/members/login' })}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-blue-100 hover:bg-white/10 hover:text-white transition-colors"
          >
            <FiLogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Members Area frame: a fixed side menu on large screens, a top bar with a
 * slide-out menu on smaller ones. The login page gets no frame.
 */
export default function MembersShell({ user, children }: { user: ShellUser | null; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const cameBack = useRef(false);

  // Back/Forward should return to where the user was, so remember when that's how they arrived
  useEffect(() => {
    const onPop = () => (cameBack.current = true);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // A new page starts at the top (the shared layout would otherwise keep the old
  // scroll position), and the slide-out menu closes
  useEffect(() => {
    setOpen(false);
    if (cameBack.current) {
      cameBack.current = false;
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  // Escape closes the slide-out menu
  useEffect(() => {
    if (!open) return;
    const escape = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', escape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', escape);
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!user || pathname.startsWith('/members/login')) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Large screens: fixed side menu */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 print:hidden lg:block">
        <Sidebar user={user} pathname={pathname} />
      </aside>

      {/* Smaller screens: top bar + slide-out menu */}
      <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 print:hidden lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="-ml-2 rounded-md p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Open menu"
          aria-expanded={open}
        >
          <FiMenu className="h-5 w-5" />
        </button>
        <Link href="/members" className="flex items-center gap-2">
          <img src="/logo.png" alt="" className="h-7 w-auto" />
          <span className="font-bold text-brand-dark-blue font-helvetica">Members Area</span>
        </Link>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 print:hidden lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-gray-900/50" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-xl">
            <Sidebar user={user} pathname={pathname} onNavigate={() => setOpen(false)} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 rounded-md p-1.5 text-blue-100 hover:bg-white/10 hover:text-white"
              aria-label="Close menu"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="lg:pl-64 print:pl-0">{children}</div>
    </div>
  );
}
