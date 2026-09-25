import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getMemberDocumentBySlug, type DocumentTargetingParams } from '@/lib/sanity';
import { getEditableById } from '@/lib/documents/admin';
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

  const isAdmin = session.user.role === 'admin';

  if (!doc || doc.category !== 'documents' || doc.subcategory !== params.subcategory) {
    // Admins opening a document that isn't published yet go to its editor
    if (isAdmin) redirect(`/members/documents/${params.subcategory}/${params.slug}/edit`);
    notFound();
  }

  const hasDraft = isAdmin ? !!(await getEditableById(doc._id)).draft : false;

  return (
    <DocumentView
      document={doc}
      subcategory={params.subcategory}
      subcategoryTitle={VALID_SUBCATEGORIES[params.subcategory]}
      viewer={{ name: session.user.name || session.user.email, email: session.user.email }}
      editHref={isAdmin ? `/members/documents/${params.subcategory}/${params.slug}/edit` : undefined}
      hasDraft={hasDraft}
    />
  );
}
