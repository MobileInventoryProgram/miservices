import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getMemberScope } from '@/lib/members-access';
import PageHeader from '@/components/members/PageHeader';
import ContactForm from '../ContactForm';

export const metadata: Metadata = {
  title: 'Add Contact | Members Area | miServices',
};

export default async function NewContactPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  const scope = await getMemberScope(session);
  if (!scope?.franchiseeId) {
    redirect('/members/contacts');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader width="3xl"
        title="Add Contact"
        breadcrumbs={[{ label: 'Contacts', href: '/members/contacts' }, { label: 'Add Contact' }]}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ContactForm cancelHref="/members/contacts" />
      </div>
    </div>
  );
}
