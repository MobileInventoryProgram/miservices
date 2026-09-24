import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { franchisesIn, getContactsForScope } from '@/lib/crm/contacts';
import { getMemberScope } from '@/lib/members-access';
import { getMemberDocumentsByCategory } from '@/lib/sanity';
import ContactsListing from './ContactsListing';

export const metadata: Metadata = {
  title: 'Contacts | Franchise Login | miServices',
};

export default async function ContactsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  const scope = await getMemberScope(session);
  if (!scope) {
    redirect('/members');
  }

  const [contacts, directoryDocs] = await Promise.all([
    getContactsForScope(scope),
    getMemberDocumentsByCategory('contacts', {
      memberId: session.user.id,
      franchiseeId: session.user.franchiseeId || null,
      role: session.user.role,
    }),
  ]);

  return (
    <ContactsListing
      contacts={contacts}
      isAdmin={scope.isAdmin}
      canCreate={!!scope.franchiseeId}
      franchises={scope.isAdmin ? franchisesIn(contacts) : []}
      directoryCount={directoryDocs.length}
    />
  );
}
