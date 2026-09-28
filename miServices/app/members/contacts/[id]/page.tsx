import { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { FiAlertCircle, FiEdit2, FiFileText, FiMail, FiMapPin, FiPhone, FiPlus, FiSend } from 'react-icons/fi';
import { authOptions } from '@/lib/auth-options';
import { contactName, getContactForScope } from '@/lib/crm/contacts';
import { marketingState } from '@/lib/crm/types';
import { clientTypeLabel } from '@/lib/crm/options';
import { jobTypeLabel } from '@/lib/job-types';
import { getMemberScope } from '@/lib/members-access';
import { getQuotesPage } from '@/lib/quote/quotes';
import PageHeader, { headerSecondaryButton } from '@/components/members/PageHeader';
import { effectiveStatus } from '@/lib/quote/types';
import QuoteStatusBadge from '../../quoting/QuoteStatusBadge';
import StatusBadge from '../StatusBadge';
import ArchiveContactButton from './ArchiveContactButton';

export const metadata: Metadata = {
  title: 'Contact | Members Area | miServices',
};

function formatDate(value?: string) {
  return value
    ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
}

export default async function ContactPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  const { id } = await params;
  const scope = await getMemberScope(session);
  const contact = scope ? await getContactForScope(scope, id) : null;

  if (!contact) {
    notFound();
  }

  // Latest few here; the full, paged list is in Quotes filtered to this client
  const { items: quotes, total: quoteTotal } = await getQuotesPage(scope!, { contact: id, page: 1, pageSize: 10 });
  const canQuote = scope!.franchiseeId === contact.franchiseId;

  const details: { label: string; value: React.ReactNode }[] = [
    { label: 'Company', value: contact.companyName || '—' },
    { label: 'Client type', value: clientTypeLabel(contact.clientType) || '—' },
    { label: 'Number of properties', value: contact.propertyCount ?? '—' },
    {
      label: 'Job types',
      value: contact.jobTypes?.length ? contact.jobTypes.map(jobTypeLabel).join(', ') : '—',
    },
    { label: 'Owner', value: contact.ownerName || '—' },
    ...(scope!.isAdmin ? [{ label: 'Franchise', value: contact.franchiseName || '—' }] : []),
    { label: 'Added', value: `${formatDate(contact.createdAt)}${contact.source === 'quote' ? ' (while quoting)' : ''}` },
    { label: 'Last updated', value: formatDate(contact.updatedAt) },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader width="5xl"
        title={
          <span className="flex items-center gap-3">
            {contactName(contact)}
            <StatusBadge status={contact.status} />
          </span>
        }
        intro={contact.companyName && (contact.firstName || contact.lastName) && contact.companyName}
        breadcrumbs={[{ label: 'Contacts', href: '/members/contacts' }, { label: contactName(contact) }]}
        actions={
          <Link href={`/members/contacts/${id}/edit`} className={`${headerSecondaryButton} self-start`}>
            <FiEdit2 className="w-4 h-4" />
            Edit
          </Link>
        }
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 font-helvetica mb-4">Details</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              {details.map((item) => (
                <div key={item.label}>
                  <dt className="text-gray-500">{item.label}</dt>
                  <dd className="mt-0.5 text-gray-900">{item.value}</dd>
                </div>
              ))}
            </dl>
            {contact.notes && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h3 className="text-sm text-gray-500 mb-1">Notes</h3>
                <p className="text-sm text-gray-900 whitespace-pre-line">{contact.notes}</p>
              </div>
            )}
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-lg font-semibold text-gray-900 font-helvetica">Quotes</h2>
              {canQuote && (
                <Link
                  href={`/members/quoting/new?contactId=${id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-brand-light-blue rounded-md hover:bg-brand-dark-blue transition-colors"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                  New quote
                </Link>
              )}
            </div>
            {quotes.length === 0 ? (
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <FiFileText className="w-4 h-4" />
                No quotes for this contact yet.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 text-sm">
                {quotes.map((quote) => (
                  <li key={quote._id} className="flex items-center justify-between gap-3 py-2">
                    <Link href={`/members/quoting/${quote._id}`} className="font-medium text-brand-dark-blue hover:text-brand-light-blue">
                      {quote.reference}
                    </Link>
                    <span className="text-gray-500">{quote.priceListTitle}</span>
                    <QuoteStatusBadge status={effectiveStatus(quote)} />
                  </li>
                ))}
              </ul>
            )}
            {quoteTotal > quotes.length && (
              <Link href={`/members/quoting?contact=${id}`} className="mt-3 inline-block text-sm font-medium text-brand-light-blue hover:text-brand-dark-blue">
                View all {quoteTotal} quotes →
              </Link>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-sm space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 font-helvetica">Get in touch</h2>
            {contact.email ? (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-brand-light-blue hover:text-brand-dark-blue break-all">
                <FiMail className="w-4 h-4 flex-shrink-0" />
                {contact.email}
              </a>
            ) : (
              <p className="flex items-center gap-2 text-gray-400">
                <FiMail className="w-4 h-4" /> No email
              </p>
            )}
            {contact.phone ? (
              <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-brand-light-blue hover:text-brand-dark-blue">
                <FiPhone className="w-4 h-4 flex-shrink-0" />
                {contact.phone}
              </a>
            ) : (
              <p className="flex items-center gap-2 text-gray-400">
                <FiPhone className="w-4 h-4" /> No phone
              </p>
            )}
            {(contact.address || contact.postcode) && (
              <p className="flex items-start gap-2 text-gray-700">
                <FiMapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="whitespace-pre-line">{[contact.address, contact.postcode].filter(Boolean).join('\n')}</span>
              </p>
            )}
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-sm space-y-2">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 font-helvetica">
              <FiSend className="w-4 h-4 text-gray-400" /> Marketing emails
            </h2>
            {marketingState(contact.marketing) === 'subscribed' && (
              <>
                <p className="font-medium text-green-700">Subscribed</p>
                <p className="text-gray-500">
                  Agreed {formatDate(contact.marketing?.consentAt)}
                  {contact.marketing?.consentBy && `, recorded by ${contact.marketing.consentBy}`}.
                </p>
              </>
            )}
            {marketingState(contact.marketing) === 'unsubscribed' && (
              <>
                <p className="font-medium text-gray-700">Unsubscribed</p>
                <p className="text-gray-500">On {formatDate(contact.marketing?.unsubscribedAt || undefined)}, using the link in an email.</p>
              </>
            )}
            {marketingState(contact.marketing) === 'none' && <p className="text-gray-500">Not signed up. Tick the box when editing, if they’ve agreed.</p>}
            {contact.marketing?.syncError && (
              <p className="flex items-start gap-1.5 text-amber-800">
                <FiAlertCircle className="mt-0.5 w-4 h-4 flex-shrink-0" />
                The mailing list couldn’t be updated. It will try again next time this contact is saved.
              </p>
            )}
          </section>

          <ArchiveContactButton contactId={id} />
        </aside>
      </div>
    </div>
  );
}
