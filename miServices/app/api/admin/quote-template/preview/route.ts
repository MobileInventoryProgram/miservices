import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { buildQuoteDocument } from '@/lib/quote/document';
import { sampleQuote } from '@/lib/quote/sample';
import { parseQuoteTemplateInput } from '@/lib/quote/template-validate';
import { getDefaultStandardPriceList } from '@/lib/sanity';

/** POST — A sample quote built from unsaved template changes, for the preview */
export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { data, error } = parseQuoteTemplateInput(await request.json().catch(() => null));
  if (!data) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const priceList = await getDefaultStandardPriceList();
  return NextResponse.json(buildQuoteDocument(sampleQuote(data.validityDays), data, priceList));
}
