import type { IconType } from 'react-icons';
import { FiBook, FiClock, FiEdit3, FiFileText, FiGrid, FiImage, FiLayers, FiPrinter, FiUsers } from 'react-icons/fi';
import FiPoundSign from '@/components/icons/FiPoundSign';

/** Members Area side menu */
export interface NavItem {
  href: string;
  label: string;
  icon: IconType;
  /** Other paths that belong to this item (the longest match wins) */
  also?: string[];
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
      { href: '/members/pricing', label: 'Price lists', icon: FiPoundSign as IconType },
      { href: '/members/pricing-documents', label: 'Pricing leaflets', icon: FiPrinter },
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
      { href: '/members/pricing/admin', label: 'Standard price lists', icon: FiLayers },
      { href: '/members/quoting/template', label: 'Quote template', icon: FiEdit3 },
      { href: '/members/timesheets', label: 'Timesheets', icon: FiClock },
    ],
  },
];

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
