import type { Session } from 'next-auth';
import { getFranchiseeForSession } from '@/lib/sanity';

/**
 * Who a member is acting as, for franchise-owned records (contacts, quotes).
 * Franchise members share their franchise's records; Head Office admins see
 * every franchise. An admin may also be linked to a franchise (e.g. Head
 * Office) and then creates records for that franchise.
 */
export interface MemberScope {
  isAdmin: boolean;
  memberId: string;
  /** Franchise new records belong to; null for an admin with no franchise */
  franchiseeId: string | null;
}

export async function getMemberScope(session: Session): Promise<MemberScope | null> {
  const isAdmin = session.user.role === 'admin';
  const franchisee = await getFranchiseeForSession(session);

  if (!franchisee && !isAdmin) return null;

  return { isAdmin, memberId: session.user.id, franchiseeId: franchisee?._id || null };
}

/** GROQ filter limiting a query to what the scope can see (uses $franchiseeId) */
export function scopeFilter(scope: MemberScope): string {
  return scope.isAdmin ? '' : ' && franchise._ref == $franchiseeId';
}
