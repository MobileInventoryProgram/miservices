import { NextResponse } from 'next/server';
import { getQuoteByToken } from '@/lib/quote/quotes';
import { quotePdfResponse } from '@/lib/quote/render';

export const runtime = 'nodejs';

/** GET — Public PDF of a sent quote (no login). */
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const quote = await getQuoteByToken(token);
    if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    return await quotePdfResponse(quote);
  } catch (error) {
    console.error('Error generating public quote PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
