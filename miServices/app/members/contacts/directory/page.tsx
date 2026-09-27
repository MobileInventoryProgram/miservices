import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getMemberDocumentsByCategory, type DocumentTargetingParams } from '@/lib/sanity';
import CategoryDocuments from '../../[category]/CategoryDocuments';

export const metadata: Metadata = {
  title: 'Key Contacts & Directory | Members Area | miServices',
};

/** Head Office "contacts" documents (key contacts, directories), now under Contacts. */
export default async function ContactsDirectoryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  const targeting: DocumentTargetingParams = {
    memberId: session.user.id,
    franchiseeId: session.user.franchiseeId || null,
    role: session.user.role,
  };

  const docs = await getMemberDocumentsByCategory('contacts', targeting);

  return (
    <CategoryDocuments
      category="contacts/directory"
      categoryTitle="Key Contacts & Directory"
      documents={docs}
      backHref="/members/contacts"
      backLabel="Contacts"
    />
  );
}
