import 'server-only';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import type { Session } from 'next-auth';
import { sanityWriteClient } from '@/lib/sanity';

/**
 * Which franchise a profile edit applies to. Franchise members always edit
 * their own (active) franchise, whatever they send. Head Office can name any
 * franchise with `requestedId`, including hidden or inactive ones.
 */
export async function resolveEditableFranchisee<T extends { _id: string }>(
  session: Session,
  requestedId: unknown,
  projection: string
): Promise<{ franchisee: T; asAdmin: boolean; response?: never } | { franchisee?: never; asAdmin?: never; response: NextResponse }> {
  const isAdmin = session.user.role === 'admin';

  if (isAdmin && typeof requestedId === 'string' && requestedId) {
    const franchisee = await sanityWriteClient.fetch<T | null>(`*[_type == "franchisee" && _id == $id][0] ${projection}`, { id: requestedId });
    if (!franchisee) return { response: NextResponse.json({ error: 'Franchisee not found' }, { status: 404 }) };
    return { franchisee, asAdmin: true };
  }

  if (!session.user.franchiseeId && !session.user.territory) {
    return { response: NextResponse.json({ error: 'No franchisee linked to your account' }, { status: 403 }) };
  }

  // Reference first, territory as the legacy fallback
  let franchisee: T | null = null;
  if (session.user.franchiseeId) {
    franchisee = await sanityWriteClient.fetch<T | null>(`*[_type == "franchisee" && _id == $id && isActive == true][0] ${projection}`, {
      id: session.user.franchiseeId,
    });
  }
  if (!franchisee && session.user.territory) {
    franchisee = await sanityWriteClient.fetch<T | null>(`*[_type == "franchisee" && territory == $territory && isActive == true][0] ${projection}`, {
      territory: session.user.territory,
    });
  }
  if (!franchisee) return { response: NextResponse.json({ error: 'Franchisee document not found' }, { status: 404 }) };
  return { franchisee, asAdmin: false };
}

/** Refresh the public pages a franchise appears on */
export function revalidateNetwork(slug?: string | null) {
  if (slug) revalidatePath(`/our-network/${slug}`);
  revalidatePath('/our-network');
  revalidatePath('/sitemap.xml');
}
