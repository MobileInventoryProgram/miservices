import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getQuoteTemplate } from '@/lib/quote/quotes';
import { parseQuoteTemplateInput } from '@/lib/quote/template-validate';
import { sanityWriteClient } from '@/lib/sanity';

/** GET — The current quote template (saved values over the defaults) */
export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;
  return NextResponse.json(await getQuoteTemplate());
}

/**
 * PUT — Save the Head Office quote template. Draft quotes pick it up straight
 * away; sent quotes keep the wording they were sent with.
 */
export async function PUT(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { data, error } = parseQuoteTemplateInput(await request.json());
    if (!data) {
      return NextResponse.json({ error }, { status: 400 });
    }

    // Same singleton Studio edits, so both stay in step
    await sanityWriteClient.createOrReplace({
      _id: 'quoteTemplate',
      _type: 'quoteTemplate',
      cover: data.cover,
      booking: data.booking,
      miProgram: {
        ...data.miProgram,
        tiers: data.miProgram.tiers.map((tier) => ({ _key: `tier-${tier.upTo}`, ...tier })),
      },
      sections: data.sections.map((section) => ({ _key: section.key, ...section })),
      validityDays: data.validityDays,
      emailSubject: data.emailSubject,
      emailMessage: data.emailMessage,
    });

    return NextResponse.json({ success: true, template: data });
  } catch (error) {
    console.error('Error saving quote template:', error);
    return NextResponse.json({ error: 'Failed to save the quote template' }, { status: 500 });
  }
}
