import { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import PageHeader from '@/components/members/PageHeader';
import QuoteSlides from '@/components/quote/QuoteSlides';
import { authOptions } from '@/lib/auth-options';
import { isEmailConfigured } from '@/lib/email/send';
import { getFlyerImageInfo } from '@/lib/flyer/assets';
import { jobTypeLabel } from '@/lib/job-types';
import { getMemberScope } from '@/lib/members-access';
import { getQuoteForScope, getQuoteTemplate, quotePlaceholderValues } from '@/lib/quote/quotes';
import { getQuoteDocument } from '@/lib/quote/render';
import { fillPlaceholders } from '@/lib/quote/template';
import { effectiveStatus, formatQuoteDate, quoteClientName } from '@/lib/quote/types';
import QuoteStatusBadge from '../QuoteStatusBadge';
import QuoteActions from './QuoteActions';

export const metadata: Metadata = {
  title: 'Quote | Members Area | miServices',
};

export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  const { id } = await params;
  const scope = await getMemberScope(session);
  const quote = scope ? await getQuoteForScope(scope, id) : null;

  if (!quote) {
    notFound();
  }

  const status = effectiveStatus(quote);
  const [document, template] = await Promise.all([getQuoteDocument(quote), getQuoteTemplate()]);
  const values = quotePlaceholderValues(quote, template);
  const base = (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
  const shareUrl = quote.shareToken ? `${base}/quote/${quote.shareToken}` : null;

  const answered = quote.status === 'accepted' || quote.status === 'declined';
  const steps = [
    { label: 'Created', date: quote.createdAt, detail: quote.ownerName ? `by ${quote.ownerName}` : '' },
    { label: 'Sent', date: quote.sentAt, detail: quote.sentTo ? `to ${quote.sentTo}` : quote.sentAt ? 'Client link created' : '' },
    { label: 'Viewed', date: quote.viewedAt, detail: quote.viewedAt ? 'by the client' : '' },
    {
      label: quote.status === 'declined' ? 'Declined' : 'Accepted',
      date: answered ? quote.respondedAt : undefined,
      detail: answered
        ? [quote.respondedByName && `by ${quote.respondedByName}`, quote.declineReason && `“${quote.declineReason}”`].filter(Boolean).join(' · ')
        : '',
    },
  ];
  const stepDate = (date: string) =>
    new Date(date).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  const details: { label: string; value: React.ReactNode }[] = [
    {
      label: 'Client',
      value: quote.contact ? (
        <Link href={`/members/contacts/${quote.contact._id}`} className="text-brand-light-blue hover:text-brand-dark-blue">
          {quoteClientName(quote)}
        </Link>
      ) : (
        '—'
      ),
    },
    { label: 'Price list', value: document.priceListTitle || quote.priceListTitle || '—' },
    { label: 'Properties', value: quote.propertyCount ?? '—' },
    { label: 'Job types', value: quote.jobTypes?.length ? quote.jobTypes.map(jobTypeLabel).join(', ') : '—' },
    { label: 'Valid until', value: formatQuoteDate(quote.validUntil) },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <PageHeader width="6xl"
        title={
          <span className="inline-flex flex-wrap items-center gap-3">
            {quote.reference}
            <QuoteStatusBadge status={status} />
          </span>
        }
        intro={
          <>
            {quoteClientName(quote)}
            {quote.contact?.companyName && quote.contact.companyName !== quoteClientName(quote) ? ` · ${quote.contact.companyName}` : ''}
            {scope!.isAdmin && quote.franchise.companyName ? ` · ${quote.franchise.companyName}` : ''}
          </>
        }
        breadcrumbs={[{ label: 'Quotes', href: '/members/quoting' }, { label: quote.reference || 'Quote' }]}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Actions */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 px-5 py-4" aria-label="Quote actions">
          <QuoteActions
            quoteId={quote._id}
            status={status}
            shareUrl={shareUrl}
            clientEmail={quote.sentTo || quote.contact?.email || ''}
            emailSubject={fillPlaceholders(quote.emailSubject || '', values)}
            emailMessage={fillPlaceholders(quote.emailMessage || '', values)}
            emailEnabled={isEmailConfigured()}
            canDuplicate={scope!.isAdmin || scope!.franchiseeId === quote.franchise._id}
          />
        </section>

        {status === 'draft' && (
          <p className="text-sm text-gray-500">Draft preview — this is exactly what the client will see once you send it.</p>
        )}
        <QuoteSlides
          data={document}
          logoSrc={getFlyerImageInfo().logo?.src}
          closing={<p className="text-sm text-gray-600">The client accepts or declines the quote here.</p>}
        />

        {/* Summary */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 py-5 text-sm sm:grid-cols-3 lg:grid-cols-5">
            {details.map((item) => (
              <div key={item.label} className="min-w-0">
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">{item.label}</dt>
                <dd className="mt-1 truncate font-medium text-gray-900">{item.value}</dd>
              </div>
            ))}
          </dl>

          <div className="px-6 py-6">
            <h2 className="sr-only">Progress</h2>
            <ol className="grid grid-cols-2 gap-y-6 sm:grid-cols-4">
              {steps.map((step, i) => {
                const done = !!step.date;
                const declined = step.label === 'Declined' && done;
                return (
                  <li key={step.label} className="relative pr-4">
                    {i < steps.length - 1 && (
                      <span
                        aria-hidden="true"
                        className={`absolute left-3 right-0 top-3 hidden h-0.5 sm:block ${steps[i + 1].date ? 'bg-brand-light-blue' : 'bg-gray-200'}`}
                      />
                    )}
                    <span
                      className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                        declined
                          ? 'border-red-500 bg-red-500'
                          : done
                            ? 'border-brand-light-blue bg-brand-light-blue'
                            : 'border-gray-300 bg-white'
                      }`}
                    >
                      {done && <span className="h-2 w-2 rounded-full bg-white" />}
                    </span>
                    <p className={`mt-2 text-sm font-medium ${done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                    <p className="text-xs text-gray-500">{step.date ? stepDate(step.date) : 'Not yet'}</p>
                    {step.detail && <p className="text-xs text-gray-500 break-words">{step.detail}</p>}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}
