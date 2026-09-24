import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getMemberDocumentBySlug, type DocumentTargetingParams } from '@/lib/sanity';
import DocumentView from '../../../[category]/[slug]/DocumentView';

export const metadata: Metadata = {
  title: 'Brand Assets | Franchise Login | miServices',
};

/** Head Office uploaded asset files, listed under Brand Assets → More downloads */
export default async function AssetFilePage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/members/login');
  }

  const targeting: DocumentTargetingParams = {
    memberId: session.user.id,
    franchiseeId: session.user.franchiseeId || null,
    role: session.user.role,
  };
  const doc = await getMemberDocumentBySlug(params.slug, targeting);
  if (!doc || doc.category !== 'assets') {
    notFound();
  }

  return <DocumentView document={doc} category="assets/brand" categoryTitle="Brand Assets" />;
}
