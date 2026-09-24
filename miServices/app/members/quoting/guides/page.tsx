import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getMemberDocumentsByCategory, type DocumentTargetingParams } from '@/lib/sanity';
import CategoryDocuments from '../../[category]/CategoryDocuments';

export const metadata: Metadata = {
  title: 'Quoting Guides | Franchise Login | miServices',
};

/** Head Office "quoting" documents (guides, templates), now under Quotes. */
export default async function QuotingGuidesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  const targeting: DocumentTargetingParams = {
    memberId: session.user.id,
    franchiseeId: session.user.franchiseeId || null,
    role: session.user.role,
  };

  const docs = await getMemberDocumentsByCategory('quoting', targeting);

  return (
    <CategoryDocuments
      category="quoting/guides"
      categoryTitle="Quoting Guides & Templates"
      documents={docs}
      backHref="/members/quoting"
      backLabel="Quotes"
    />
  );
}
