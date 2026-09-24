import { NextResponse } from 'next/server';
import { getPriceListByShareToken } from '@/lib/sanity';
import { flyerOptionsFromUrl, priceListPdfResponse } from '@/lib/pricing-pdf-response';

export const runtime = 'nodejs';

/**
 * GET — Public PDF download for a shared price list (no login).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const priceList = await getPriceListByShareToken(token);

    if (!priceList) {
      return NextResponse.json({ error: 'Price list not found' }, { status: 404 });
    }

    return await priceListPdfResponse(priceList, flyerOptionsFromUrl(request.url));
  } catch (error) {
    console.error('Error generating shared price list PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
