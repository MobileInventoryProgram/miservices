import { NextResponse } from 'next/server';
import { requireQuote } from '@/lib/quote/api';
import { quotePdfResponse } from '@/lib/quote/render';

export const runtime = 'nodejs';

/** GET — Quote as an A4 PDF (drafts included, for checking before sending). */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const loaded = await requireQuote(id);
    if (!loaded.ok) return loaded.response;
    return await quotePdfResponse(loaded.value.quote);
  } catch (error) {
    console.error('Error generating quote PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
