import { NextResponse } from 'next/server';
import { sanityWriteClient } from '@/lib/sanity';
import { checkQuoteReferences, requireQuote } from '@/lib/quote/api';
import { getQuoteTemplate } from '@/lib/quote/quotes';
import { draftSections, parseQuoteInput } from '@/lib/quote/validate';

/**
 * PUT — Update a draft quote. Sent quotes can't be changed.
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const loaded = await requireQuote(id);
    if (!loaded.ok) return loaded.response;
    const { scope, quote } = loaded.value;

    if (quote.status !== 'draft') {
      return NextResponse.json({ error: 'This quote has been sent and can no longer be edited.' }, { status: 409 });
    }

    const { data, error } = parseQuoteInput(await request.json());
    if (!data) return NextResponse.json({ error }, { status: 400 });

    const refError = await checkQuoteReferences(scope, quote.franchise._id, data);
    if (refError) return NextResponse.json({ error: refError }, { status: 400 });

    const template = await getQuoteTemplate();
    await sanityWriteClient
      .patch(id)
      .set({
        contact: { _type: 'reference', _ref: data.contactId, _weak: true },
        priceList: { _type: 'reference', _ref: data.priceListId, _weak: true },
        propertyCount: data.propertyCount,
        jobTypes: data.jobTypes,
        sections: draftSections(template, data),
        validUntil: data.validUntil,
        emailSubject: data.emailSubject || template.emailSubject,
        emailMessage: data.emailMessage || template.emailMessage,
        updatedAt: new Date().toISOString(),
      })
      .commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

/**
 * DELETE — Delete a draft. Sent quotes are kept as a record.
 */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const loaded = await requireQuote(id);
    if (!loaded.ok) return loaded.response;

    if (loaded.value.quote.status !== 'draft') {
      return NextResponse.json({ error: 'Sent quotes are kept as a record and cannot be deleted.' }, { status: 409 });
    }

    await sanityWriteClient.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting quote:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
