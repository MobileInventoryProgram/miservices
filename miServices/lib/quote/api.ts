import { NextResponse } from 'next/server';
import { getServerSession, type Session } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getContactForScope } from '@/lib/crm/contacts';
import { getMemberScope, type MemberScope } from '@/lib/members-access';
import { getPriceListById, getVisiblePriceList } from '@/lib/sanity';
import { getQuoteForScope } from '@/lib/quote/quotes';
import type { Quote } from '@/lib/quote/types';
import type { QuoteInput } from '@/lib/quote/validate';

type Loaded<T> = { ok: true; value: T } | { ok: false; response: NextResponse };

const fail = (error: string, status: number) => ({ ok: false as const, response: NextResponse.json({ error }, { status }) });

/** Session + scope for a quotes API route */
export async function requireScope(): Promise<Loaded<{ session: Session; scope: MemberScope }>> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return fail('Unauthorised', 401);
  const scope = await getMemberScope(session);
  if (!scope) return fail('Your account is not linked to a franchise.', 403);
  return { ok: true, value: { session, scope } };
}

/** A quote the member can see (their franchise's, or any for admins) */
export async function requireQuote(id: string): Promise<Loaded<{ session: Session; scope: MemberScope; quote: Quote }>> {
  const auth = await requireScope();
  if (!auth.ok) return auth;
  const quote = await getQuoteForScope(auth.value.scope, id);
  if (!quote) return fail('Quote not found', 404);
  return { ok: true, value: { ...auth.value, quote } };
}

/**
 * Check the chosen contact and price list are ones this franchise may use.
 * The contact must belong to the quote's franchise.
 */
export async function checkQuoteReferences(scope: MemberScope, franchiseId: string, input: QuoteInput): Promise<string | null> {
  const contact = await getContactForScope(scope, input.contactId);
  if (!contact || contact.franchiseId !== franchiseId) return 'That client could not be found.';

  const priceList = scope.isAdmin
    ? await getPriceListById(input.priceListId)
    : await getVisiblePriceList(input.priceListId, franchiseId);
  if (!priceList) return 'That price list could not be found.';
  return null;
}
