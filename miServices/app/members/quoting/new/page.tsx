import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import PageHeader from '@/components/members/PageHeader';
import { authOptions } from '@/lib/auth-options';
import { getMemberScope } from '@/lib/members-access';
import { defaultValidUntil, editableDefaults, getBuilderData } from '@/lib/quote/builder-data';
import QuoteBuilder from '../QuoteBuilder';

export const metadata: Metadata = {
  title: 'New Quote | Members Area | miServices',
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
      <PageHeader width="4xl"
        title="New Quote"
        intro="Choose the client and price list, then tailor the wording."
        breadcrumbs={
          contact
            ? [
                { label: 'Contacts', href: '/members/contacts' },
                { label: contact.name, href: `/members/contacts/${contact._id}` },
                { label: 'New quote' },
              ]
            : [{ label: 'Quotes', href: '/members/quoting' }, { label: 'New quote' }]
        }
      />
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
