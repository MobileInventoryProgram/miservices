import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getMemberDocumentsByCategory, type DocumentTargetingParams } from '@/lib/sanity';
import CategoryDocuments from '../[category]/CategoryDocuments';

export const metadata: Metadata = {
  title: 'Pricing Documents | Members Area | miServices',
};

export default async function PricingDocumentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  const targeting: DocumentTargetingParams = {
    memberId: session.user.id,
    franchiseeId: session.user.franchiseeId || null,
    role: session.user.role,
  };

  const docs = await getMemberDocumentsByCategory('pricing', targeting);

  return (
    <CategoryDocuments
      category="pricing-documents"
      categoryTitle="Pricing Documents"
      documents={docs}
    />
  );
}
