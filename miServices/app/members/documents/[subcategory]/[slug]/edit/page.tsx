import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getDocumentForEditing } from '@/lib/documents/admin';
import { DOC_SUBCATEGORIES } from '@/lib/documents/validate';
import DocumentEditor from '@/components/documents/DocumentEditor';

export const metadata: Metadata = {
  title: 'Edit Document | Franchise Login | miServices',
};

export const dynamic = 'force-dynamic';

export default async function EditDocumentPage({ params }: { params: { subcategory: string; slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/members/login');
  if (session.user.role !== 'admin') redirect(`/members/documents/${params.subcategory}/${params.slug}`);

  const found = await getDocumentForEditing(params.slug);
  if (!found) notFound();
  const { id, published, draft } = found;
  const working = draft || published!;
  if (working.category !== 'documents') notFound();

  // Moved to another section: keep the address right
  if (working.subcategory && working.subcategory !== params.subcategory && DOC_SUBCATEGORIES[working.subcategory]) {
    redirect(`/members/documents/${working.subcategory}/${params.slug}/edit`);
  }
  const subcategory = working.subcategory || params.subcategory;

  return (
    <DocumentEditor
      key={`${draft?._rev || ''}-${published?._rev || ''}`}
      id={id}
      slug={params.slug}
      viewHref={published ? `/members/documents/${published.subcategory || subcategory}/${params.slug}` : null}
      listHref={`/members/documents/${subcategory}`}
      subcategories={DOC_SUBCATEGORIES}
      initial={{
        title: working.title || '',
        description: working.description || '',
        subcategory,
        order: working.order ?? 0,
        numberHeadings: !!working.numberHeadings,
        isPublished: working.isPublished !== false,
        body: working.body || [],
      }}
      draftRev={draft?._rev || null}
      publishedRev={published?._rev || null}
      hasDraft={!!draft}
      hasPublished={!!published}
    />
  );
}
