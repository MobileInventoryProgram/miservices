import { NextResponse } from 'next/server';
import { sanityWriteClient } from '@/lib/sanity';
import { checkQuoteReferences, requireScope } from '@/lib/quote/api';
import { getQuoteTemplate, nextQuoteReference } from '@/lib/quote/quotes';
import { draftSections, parseQuoteInput } from '@/lib/quote/validate';

/**
 * POST — Create a draft quote for the member's franchise.
 * Returns: { id }
 */
export async function POST(request: Request) {
  try {
    const auth = await requireScope();
    if (!auth.ok) return auth.response;
    const { scope } = auth.value;

    if (!scope.franchiseeId) {
      return NextResponse.json(
        { error: 'Your account is not linked to a franchise, so it cannot create quotes.' },
        { status: 403 }
      );
    }

    const { data, error } = parseQuoteInput(await request.json());
    if (!data) return NextResponse.json({ error }, { status: 400 });

    const refError = await checkQuoteReferences(scope, scope.franchiseeId, data);
    if (refError) return NextResponse.json({ error: refError }, { status: 400 });

    const [template, reference] = await Promise.all([getQuoteTemplate(), nextQuoteReference(scope.franchiseeId)]);
    const now = new Date().toISOString();

    const doc = await sanityWriteClient.create({
      _type: 'quote',
      reference,
      status: 'draft',
      franchise: { _type: 'reference', _ref: scope.franchiseeId },
      owner: { _type: 'reference', _ref: scope.memberId, _weak: true },
      contact: { _type: 'reference', _ref: data.contactId, _weak: true },
      priceList: { _type: 'reference', _ref: data.priceListId, _weak: true },
      propertyCount: data.propertyCount,
      jobTypes: data.jobTypes,
      sections: draftSections(template, data),
      validUntil: data.validUntil,
      emailSubject: data.emailSubject || template.emailSubject,
      emailMessage: data.emailMessage || template.emailMessage,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ id: doc._id }, { status: 201 });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
