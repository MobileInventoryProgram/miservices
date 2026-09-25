import type { Session } from 'next-auth';
import { getFranchiseeForSession, sanityWriteClient } from '@/lib/sanity';

/**
 * Who a member is acting as, for franchise-owned records (contacts, quotes).
 * Franchise members share their franchise's records; Head Office admins see
 * every franchise. Admins are Head Office: records they create belong to the
 * Head Office franchise.
 */
export interface MemberScope {
  isAdmin: boolean;
  memberId: string;
  /** Franchise new records belong to (Head Office for admins) */
  franchiseeId: string | null;
}

export async function getMemberScope(session: Session): Promise<MemberScope | null> {
  const isAdmin = session.user.role === 'admin';
  const franchisee = await getFranchiseeForSession(session);

  if (!franchisee && !isAdmin) return null;

  // Admins are Head Office: their own quotes and clients belong to the Head Office franchise
  const franchiseeId = franchisee?._id || (isAdmin ? await getHeadOfficeId() : null);
  return { isAdmin, memberId: session.user.id, franchiseeId };
}

let headOfficeId: string | null = null;

/** The Head Office franchise record */
async function getHeadOfficeId(): Promise<string | null> {
  if (headOfficeId) return headOfficeId;
  headOfficeId = await sanityWriteClient.fetch<string | null>(
    `*[_type == "franchisee" && (territory == "Head Office" || companyName == "Head Office")][0]._id`
  );
  return headOfficeId;
}

/** GROQ filter limiting a query to what the scope can see (uses $franchiseeId) */
export function scopeFilter(scope: MemberScope): string {
  return scope.isAdmin ? '' : ' && franchise._ref == $franchiseeId';
}
