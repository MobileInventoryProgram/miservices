import { buildQuoteDocument, type QuoteDocumentData } from '@/lib/quote/document';
import { renderQuotePdf } from '@/lib/quote/pdf';
import { getQuotePriceList, getQuoteTemplate } from '@/lib/quote/quotes';
import type { Quote } from '@/lib/quote/types';

export async function getQuoteDocument(quote: Quote): Promise<QuoteDocumentData> {
  const [template, priceList] = await Promise.all([getQuoteTemplate(), getQuotePriceList(quote)]);
  return buildQuoteDocument(quote, template, priceList);
}

export function quotePdfFilename(quote: Pick<Quote, 'reference'>): string {
  return `miServices-quote-${(quote.reference || 'draft').toLowerCase()}.pdf`;
}

export async function quotePdfResponse(quote: Quote): Promise<Response> {
  const pdf = await renderQuotePdf(await getQuoteDocument(quote));
  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${quotePdfFilename(quote)}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}

/** Absolute site URL for links in emails */
export function siteUrl(request: Request, path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;
  return `${base.replace(/\/$/, '')}${path}`;
}
