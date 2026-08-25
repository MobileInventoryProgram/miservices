import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getMemberDocumentBySlug, type DocumentTargetingParams } from '@/lib/sanity';
import DocumentView from '../../[category]/[slug]/DocumentView';

interface DocumentPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: DocumentPageProps): Promise<Metadata> {
  const doc = await getMemberDocumentBySlug(params.slug);
  if (!doc) return {};
  return {
    title: `${doc.title} | Members Area | miServices`,
  };
}

export default async function PricingDocumentPage({ params }: DocumentPageProps) {
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

  if (!doc || doc.category !== 'pricing') {
    notFound();
  }

  return (
    <DocumentView
      document={doc}
      category="pricing-documents"
      categoryTitle="Pricing Documents"
    />
  );
}
