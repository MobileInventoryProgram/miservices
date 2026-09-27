import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import PageHeader from '@/components/members/PageHeader';
import { authOptions } from '@/lib/auth-options';
import { getMemberScope } from '@/lib/members-access';
import { editableDefaults, getBuilderData } from '@/lib/quote/builder-data';
import { getQuoteForScope } from '@/lib/quote/quotes';
import QuoteBuilder from '../../QuoteBuilder';

export const metadata: Metadata = {
  title: 'Edit Quote | Members Area | miServices',
};

export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
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
  if (quote.status !== 'draft') {
    redirect(`/members/quoting/${id}`);
  }

  const { template, priceLists, contacts } = await getBuilderData(scope!, quote.franchise._id);
  const saved = Object.fromEntries((quote.sections || []).map((s) => [s.key, s.text]));

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader width="4xl"
        title={`Edit Quote ${quote.reference}`}
        breadcrumbs={[
          { label: 'Quotes', href: '/members/quoting' },
          { label: quote.reference || 'Quote', href: `/members/quoting/${id}` },
          { label: 'Edit' },
        ]}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <QuoteBuilder
          quoteId={id}
          contacts={contacts}
          priceLists={priceLists}
          sections={template.sections}
          canAddContact={scope!.franchiseeId === quote.franchise._id}
          initialValues={{
            contactId: quote.contact?._id || '',
            priceListId: quote.priceListId || '',
            propertyCount: quote.propertyCount != null ? String(quote.propertyCount) : '',
            jobTypes: quote.jobTypes || [],
            sections: { ...editableDefaults(template), ...saved },
            validUntil: quote.validUntil || '',
            emailSubject: quote.emailSubject || template.emailSubject,
            emailMessage: quote.emailMessage || template.emailMessage,
          }}
        />
      </div>
    </div>
  );
}
