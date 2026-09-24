import { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { authOptions } from '@/lib/auth-options';
import { getMemberScope } from '@/lib/members-access';
import { defaultValidUntil, editableDefaults, getBuilderData } from '@/lib/quote/builder-data';
import QuoteBuilder from '../QuoteBuilder';

export const metadata: Metadata = {
  title: 'New Quote | Franchise Login | miServices',
};

export default async function NewQuotePage({ searchParams }: { searchParams: Promise<{ contactId?: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  const scope = await getMemberScope(session);
  if (!scope?.franchiseeId) {
    redirect('/members/quoting');
  }

  const { contactId } = await searchParams;
  const { template, priceLists, contacts } = await getBuilderData(scope, scope.franchiseeId);
  const contact = contacts.find((c) => c._id === contactId);
  const defaultList = priceLists.find((p) => p.isDefault) || priceLists[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={contact ? `/members/contacts/${contact._id}` : '/members/quoting'}
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            {contact ? `Back to ${contact.name}` : 'Back to Quotes'}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold font-helvetica">New Quote</h1>
          <p className="mt-1 text-blue-200">Choose the client and price list, then tailor the wording.</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <QuoteBuilder
          contacts={contacts}
          priceLists={priceLists}
          sections={template.sections}
          canAddContact
          initialValues={{
            contactId: contact?._id || '',
            priceListId: defaultList?._id || '',
            propertyCount: contact?.propertyCount != null ? String(contact.propertyCount) : '',
            jobTypes: contact?.jobTypes || [],
            sections: editableDefaults(template),
            validUntil: defaultValidUntil(template),
            emailSubject: template.emailSubject,
            emailMessage: template.emailMessage,
          }}
        />
      </div>
    </div>
  );
}
