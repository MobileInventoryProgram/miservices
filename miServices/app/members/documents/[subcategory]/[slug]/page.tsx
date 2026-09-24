import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getMemberDocumentBySlug, type DocumentTargetingParams } from '@/lib/sanity';
import DocumentView from './DocumentView';

const VALID_SUBCATEGORIES: Record<string, string> = {
  general: 'General',
  'operating-procedures': 'Operating Procedures',
  personnel: 'Personnel',
  training: 'Training',
};

interface DocumentPageProps {
  params: { subcategory: string; slug: string };
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

  if (!VALID_SUBCATEGORIES[params.subcategory]) {
    notFound();
  }

  const targeting: DocumentTargetingParams = {
    memberId: session.user.id,
    franchiseeId: session.user.franchiseeId || null,
    role: session.user.role,
  };

  const doc = await getMemberDocumentBySlug(params.slug, targeting);

  if (!doc || doc.category !== 'documents' || doc.subcategory !== params.subcategory) {
    notFound();
  }

  return (
    <DocumentView
      document={doc}
      subcategory={params.subcategory}
      subcategoryTitle={VALID_SUBCATEGORIES[params.subcategory]}
    />
  );
}
