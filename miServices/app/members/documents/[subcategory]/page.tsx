import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getDocumentSection, getMemberDocumentsByCategoryAndSubcategory, type DocumentTargetingParams } from '@/lib/sanity';
import { getDraftSummary } from '@/lib/documents/admin';
import { getMembersText } from '@/lib/cms/members';
import SubcategoryDocuments from './SubcategoryDocuments';


interface SubcategoryPageProps {
  params: { subcategory: string };
}

export async function generateMetadata({ params }: SubcategoryPageProps): Promise<Metadata> {
  const title = (await getDocumentSection(params.subcategory))?.title;
  if (!title) return {};
  return {
    title: `${title} | Documents | Members Area | miServices`,
  };
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  const subcategoryTitle = (await getDocumentSection(params.subcategory))?.title;

  if (!subcategoryTitle) {
    notFound();
  }

  const targeting: DocumentTargetingParams = {
    memberId: session.user.id,
    franchiseeId: session.user.franchiseeId || null,
    role: session.user.role,
  };

  const isAdmin = session.user.role === 'admin';
  const [docs, admin] = await Promise.all([
    getMemberDocumentsByCategoryAndSubcategory('documents', params.subcategory, targeting),
    isAdmin ? getDraftSummary(params.subcategory) : Promise.resolve(undefined),
  ]);

  return (
    <SubcategoryDocuments
      subcategory={params.subcategory}
      subcategoryTitle={subcategoryTitle}
      documents={docs}
      admin={admin}
      emptyText={(await getMembersText()).documents?.empty}
    />
  );
}
