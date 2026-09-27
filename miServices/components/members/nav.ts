import type { IconType } from 'react-icons';
import { FiBook, FiClock, FiEdit3, FiFileText, FiGrid, FiImage, FiUsers } from 'react-icons/fi';
import FiPoundSign from '@/components/icons/FiPoundSign';

/** Members Area side menu */
export interface NavItem {
  href: string;
  label: string;
  icon: IconType;
  /** Other paths that belong to this item (the longest match wins) */
  also?: string[];
  /** Where Head Office goes instead (their version of the same section) */
  adminHref?: string;
}

export interface NavGroup {
  label?: string;
  adminOnly?: boolean;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  { items: [{ href: '/members', label: 'Dashboard', icon: FiGrid, also: ['/members/edit-profile'] }] },
  {
    label: 'Work',
    items: [
      { href: '/members/quoting', label: 'Quotes', icon: FiFileText },
      { href: '/members/contacts', label: 'Contacts', icon: FiUsers },
      {
        href: '/members/pricing',
        label: 'Pricing',
        icon: FiPoundSign as IconType,
        adminHref: '/members/pricing/admin',
        also: ['/members/pricing-documents'],
      },
    ],
  },
  {
    label: 'Resources',
    items: [
      { href: '/members/documents', label: 'Documents', icon: FiBook },
      { href: '/members/assets', label: 'Assets', icon: FiImage },
    ],
  },
  {
    label: 'Head Office',
    adminOnly: true,
    items: [
      { href: '/members/quoting/template', label: 'Quote template', icon: FiEdit3 },
      { href: '/members/timesheets', label: 'Timesheets', icon: FiClock },
    ],
  },
];

/** The menu for a member: Head Office also gets its own group and its own version of shared sections */
export function navFor(isAdmin: boolean): NavGroup[] {
  return NAV_GROUPS.filter((g) => !g.adminOnly || isAdmin).map((g) => ({
    ...g,
    items: g.items.map((item) =>
      isAdmin && item.adminHref ? { ...item, href: item.adminHref, also: [item.href, ...(item.also || [])] } : item
    ),
  }));
}

/** The menu item for a path: the item whose path matches the most of it */
export function activeHref(pathname: string, groups: NavGroup[]): string | null {
  let best: { href: string; length: number } | null = null;
  for (const item of groups.flatMap((g) => g.items)) {
    for (const path of [item.href, ...(item.also || [])]) {
      const exact = path === '/members';
      const matches = exact ? pathname === path : pathname === path || pathname.startsWith(`${path}/`);
      if (matches && (!best || path.length > best.length)) best = { href: item.href, length: path.length };
    }
  }
  return best?.href ?? null;
}
