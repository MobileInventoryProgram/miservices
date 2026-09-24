import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getMemberDocumentsByCategory, type DocumentTargetingParams } from '@/lib/sanity';
import CategoryDocuments from './CategoryDocuments';

const VALID_CATEGORIES: Record<string, string> = {
  assets: 'Assets',
};

interface CategoryPageProps {
  params: { category: string };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const title = VALID_CATEGORIES[params.category];
  if (!title) return {};
  return {
    title: `${title} | Franchise Login | miServices`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  const categoryTitle = VALID_CATEGORIES[params.category];

  if (!categoryTitle) {
    notFound();
  }

  const targeting: DocumentTargetingParams = {
    memberId: session.user.id,
    franchiseeId: session.user.franchiseeId || null,
    role: session.user.role,
  };

  const docs = await getMemberDocumentsByCategory(params.category, targeting);

  return (
    <CategoryDocuments
      category={params.category}
      categoryTitle={categoryTitle}
      documents={docs}
    />
  );
}
