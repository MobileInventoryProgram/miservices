import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getDocumentSections, getDocumentsSubcategoryCounts, type DocumentTargetingParams } from '@/lib/sanity';
import { getMembersText } from '@/lib/cms/members';
import SubcategoryCards from './SubcategoryCards';

export const metadata: Metadata = {
  title: 'Documents | Franchise Login | miServices',
  description: 'Browse documents by subcategory.',
};

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  const targeting: DocumentTargetingParams = {
    memberId: session.user.id,
    franchiseeId: session.user.franchiseeId || null,
    role: session.user.role,
  };

  const [subcategoryCounts, sections, text] = await Promise.all([getDocumentsSubcategoryCounts(targeting), getDocumentSections(), getMembersText()]);

  return <SubcategoryCards subcategoryCounts={subcategoryCounts} sections={sections} heading={text.documents?.heading} intro={text.documents?.intro} />;
}
