import { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { FiArrowLeft, FiEdit2, FiFileText, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import { authOptions } from '@/lib/auth-options';
import { contactName, getContactForScope } from '@/lib/crm/contacts';
import { clientTypeLabel } from '@/lib/crm/options';
import { jobTypeLabel } from '@/lib/job-types';
import { getMemberScope } from '@/lib/members-access';
import StatusBadge from '../StatusBadge';
import ArchiveContactButton from './ArchiveContactButton';

export const metadata: Metadata = {
  title: 'Contact | Franchise Login | miServices',
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
      <div className="bg-brand-dark-blue text-white py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/members/contacts"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Contacts
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-bold font-helvetica">{contactName(contact)}</h1>
                <StatusBadge status={contact.status} />
              </div>
              {contact.companyName && (contact.firstName || contact.lastName) && (
                <p className="mt-1 text-blue-200">{contact.companyName}</p>
              )}
            </div>
            <Link
              href={`/members/contacts/${id}/edit`}
              className="inline-flex items-center gap-2 self-start px-4 py-2 text-sm font-medium rounded-md bg-white/10 hover:bg-white/20 transition-colors"
            >
              <FiEdit2 className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </div>
      </div>

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
            <h2 className="text-lg font-semibold text-gray-900 font-helvetica mb-2">Quotes</h2>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <FiFileText className="w-4 h-4" />
              Quotes sent to this contact will appear here once the quoting tool is live.
            </p>
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

          <ArchiveContactButton contactId={id} />
        </aside>
      </div>
    </div>
  );
}
