import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getMemberDocumentBySlug, type DocumentTargetingParams } from '@/lib/sanity';
import DocumentView from './DocumentView';

const VALID_CATEGORIES: Record<string, string> = {
  assets: 'Assets',
};

interface DocumentPageProps {
  params: { category: string; slug: string };
}

export async function generateMetadata({ params }: DocumentPageProps): Promise<Metadata> {
  const doc = await getMemberDocumentBySlug(params.slug);
  if (!doc) return {};
  return {
    title: `${doc.title} | Franchise Login | miServices`,
  };
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  if (!VALID_CATEGORIES[params.category]) {
    notFound();
  }

  const targeting: DocumentTargetingParams = {
    memberId: session.user.id,
    franchiseeId: session.user.franchiseeId || null,
    role: session.user.role,
  };

  const doc = await getMemberDocumentBySlug(params.slug, targeting);

  if (!doc || doc.category !== params.category) {
    notFound();
  }

  return (
    <DocumentView
      document={doc}
      category={params.category}
      categoryTitle={VALID_CATEGORIES[params.category]}
    />
  );
}
