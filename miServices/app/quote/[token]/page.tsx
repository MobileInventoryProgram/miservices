import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { FiCheckCircle, FiDownload, FiXCircle } from 'react-icons/fi';
import QuoteSlides from '@/components/quote/QuoteSlides';
import { authOptions } from '@/lib/auth-options';
import { getFlyerImageInfo } from '@/lib/flyer/assets';
import { sanityWriteClient } from '@/lib/sanity';
import { getQuoteByToken } from '@/lib/quote/quotes';
import { getQuoteDocument } from '@/lib/quote/render';
import { effectiveStatus, formatQuoteDate, quoteClientName } from '@/lib/quote/types';
import QuoteResponse from './QuoteResponse';

export const dynamic = 'force-dynamic';

interface QuotePageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: QuotePageProps): Promise<Metadata> {
  const { token } = await params;
  const quote = await getQuoteByToken(token);
  return {
    title: quote ? `Your quote ${quote.reference} | miServices` : 'Quote | miServices',
    robots: { index: false, follow: false },
  };
}

/**
 * Public, no-login view of a sent quote, with PDF download and accept/decline.
 */
export default async function PublicQuotePage({ params }: QuotePageProps) {
  const { token } = await params;
  const quote = await getQuoteByToken(token);

  if (!quote) {
    notFound();
  }

  // Record the first view by the client (not by the franchise checking their own link)
  if (quote.status === 'sent') {
    const session = await getServerSession(authOptions);
    const isFranchiseMember =
      session?.user && (session.user.role === 'admin' || session.user.franchiseeId === quote.franchise._id);
    if (!isFranchiseMember) {
      const now = new Date().toISOString();
      await sanityWriteClient.patch(quote._id).set({ status: 'viewed', viewedAt: now, updatedAt: now }).commit();
    }
  }

  const status = effectiveStatus(quote);
  const document = await getQuoteDocument(quote);

  const response =
    status === 'accepted' ? (
      <p className="flex items-center gap-2 text-green-700">
        <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
        Accepted by {quote.respondedByName} on {formatQuoteDate(quote.respondedAt)}. Thank you — we&apos;ll be in touch shortly.
      </p>
    ) : status === 'declined' ? (
      <p className="flex items-center gap-2 text-gray-700">
        <FiXCircle className="w-5 h-5 flex-shrink-0" />
        Declined on {formatQuoteDate(quote.respondedAt)}. Thank you for letting us know.
      </p>
    ) : status === 'expired' ? (
      <p className="text-amber-700">This quote expired on {formatQuoteDate(quote.validUntil)}. Please get in touch for an updated quote.</p>
    ) : (
      <div className="space-y-3">
        <p className="font-medium text-gray-900">Happy with this quote?</p>
        <QuoteResponse token={token} defaultName={quoteClientName(quote) === 'No client' ? '' : quoteClientName(quote)} />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 sm:py-10">
      <div className="mx-auto mb-5 flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          Quote <strong>{quote.reference}</strong> · valid until {formatQuoteDate(quote.validUntil)}
        </p>
        <a
          href={`/quote/${token}/pdf`}
          className="inline-flex items-center gap-2 rounded-md bg-brand-dark-blue px-4 py-2 text-sm font-medium text-white hover:bg-brand-light-blue transition-colors"
        >
          <FiDownload className="w-4 h-4" />
          Download PDF
        </a>
      </div>

      <QuoteSlides data={document} logoSrc={getFlyerImageInfo().logo?.src} closing={response} />
    </div>
  );
}
