import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getPriceListForSession } from '@/lib/pricing-access';
import { flyerOptionsFromUrl, priceListPdfResponse } from '@/lib/pricing-pdf-response';

export const runtime = 'nodejs';

/**
 * GET — Download a price list as an A5 flyer PDF.
 * Query: ?layout=double|single&variant=print|digital
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const { id } = await params;
    const priceList = await getPriceListForSession(session, id);

    if (!priceList) {
      return NextResponse.json({ error: 'Price list not found' }, { status: 404 });
    }

    return await priceListPdfResponse(priceList, flyerOptionsFromUrl(request.url));
  } catch (error) {
    console.error('Error generating price list PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
