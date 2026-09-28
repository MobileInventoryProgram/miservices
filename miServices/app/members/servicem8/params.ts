import 'server-only';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { previousRange, parseRange } from '@/lib/servicem8/range';

export type SearchParams = Record<string, string | string[] | undefined>;

export const param = (sp: SearchParams, key: string) => {
  const v = sp[key];
  return (Array.isArray(v) ? v[0] : v) || '';
};

/** Head Office only: every ServiceM8 page checks before pulling anything */
export async function adminOnly() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/members/login');
  if (session.user.role !== 'admin') redirect('/members');
  return session;
}

/** The chosen range (this month by default) and the same length before it */
export function rangeOf(sp: SearchParams) {
  const range = parseRange(param(sp, 'from'), param(sp, 'to'));
  return { ...range, previous: previousRange(range.from, range.to) };
}

/** A link to this page with some query values changed (null removes one) */
export function hrefWith(path: string, sp: SearchParams, changes: Record<string, string | number | null>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const value = Array.isArray(v) ? v[0] : v;
    if (value) q.set(k, value);
  }
  for (const [k, v] of Object.entries(changes)) {
    if (v === null || v === '' || (k === 'page' && Number(v) <= 1)) q.delete(k);
    else q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `${path}?${s}` : path;
}

/** CSV download link for a tab, with the page's filters */
export function csvHref(tab: string, sp: SearchParams) {
  return hrefWith('/api/admin/servicem8/export', { ...sp, page: undefined }, { tab });
}
