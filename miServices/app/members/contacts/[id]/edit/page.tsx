import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { contactName, getContactForScope } from '@/lib/crm/contacts';
import { contactToForm } from '@/lib/crm/types';
import { getMemberScope } from '@/lib/members-access';
import PageHeader from '@/components/members/PageHeader';
import ContactForm from '../../ContactForm';

export const metadata: Metadata = {
  title: 'Edit Contact | Members Area | miServices',
};

export default async function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader width="3xl"
        title="Edit Contact"
        breadcrumbs={[
          { label: 'Contacts', href: '/members/contacts' },
          { label: contactName(contact), href: `/members/contacts/${id}` },
          { label: 'Edit' },
        ]}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ContactForm contactId={id} initialValues={contactToForm(contact)} cancelHref={`/members/contacts/${id}`} />
      </div>
    </div>
  );
}
