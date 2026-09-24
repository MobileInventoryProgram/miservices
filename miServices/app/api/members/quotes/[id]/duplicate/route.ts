import { NextResponse } from 'next/server';
import { sanityWriteClient } from '@/lib/sanity';
import { requireQuote } from '@/lib/quote/api';
import { getQuoteTemplate, nextQuoteReference } from '@/lib/quote/quotes';

/**
 * POST — Start a new draft from an existing quote (same client, price list
 * and wording). Returns: { id }
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const loaded = await requireQuote(id);
    if (!loaded.ok) return loaded.response;
    const { scope, quote } = loaded.value;

    const franchiseId = quote.franchise._id;
    if (!scope.isAdmin && scope.franchiseeId !== franchiseId) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const [template, reference] = await Promise.all([getQuoteTemplate(), nextQuoteReference(franchiseId)]);
    const validUntil = new Date(Date.now() + template.validityDays * 86400000).toISOString().slice(0, 10);
    const now = new Date().toISOString();

    const doc = await sanityWriteClient.create({
      _type: 'quote',
      reference,
      status: 'draft',
      franchise: { _type: 'reference', _ref: franchiseId },
      owner: { _type: 'reference', _ref: scope.memberId, _weak: true },
      ...(quote.contact ? { contact: { _type: 'reference', _ref: quote.contact._id, _weak: true } } : {}),
      ...(quote.priceListId ? { priceList: { _type: 'reference', _ref: quote.priceListId, _weak: true } } : {}),
      propertyCount: quote.propertyCount ?? null,
      jobTypes: quote.jobTypes || [],
      sections: (quote.sections || [])
        .filter((section) => section.mode === 'editable')
        .map((section) => ({ _key: section.key, key: section.key, title: section.title, mode: section.mode, text: section.text })),
      validUntil,
      emailSubject: quote.emailSubject || template.emailSubject,
      emailMessage: quote.emailMessage || template.emailMessage,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ id: doc._id }, { status: 201 });
  } catch (error) {
    console.error('Error duplicating quote:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
