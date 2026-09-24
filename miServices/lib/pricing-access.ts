import type { Session } from 'next-auth';
import {
  getFranchiseeForSession,
  getPriceListById,
  getVisiblePriceList,
  type SanityPriceList,
} from '@/lib/sanity';

/**
 * The price list this member may view: admins can view any list,
 * franchisees their own lists plus shared templates.
 * Same rules as the read-only view at /members/pricing/[id].
 */
export async function getPriceListForSession(
  session: Session,
  listId: string
): Promise<SanityPriceList | null> {
  if (session.user.role === 'admin') {
    return getPriceListById(listId);
  }

  const franchisee = await getFranchiseeForSession(session);
  if (!franchisee) return null;

  return getVisiblePriceList(listId, franchisee._id);
}

/**
 * Whether this member may turn a list's public link off: admins for any
 * list, franchisees only for lists they own (not shared templates).
 */
export async function canManageShareLink(
  session: Session,
  priceList: SanityPriceList
): Promise<boolean> {
  if (session.user.role === 'admin') return true;
  if (!priceList.ownerRef) return false;

  const franchisee = await getFranchiseeForSession(session);
  return !!franchisee && franchisee._id === priceList.ownerRef;
}
