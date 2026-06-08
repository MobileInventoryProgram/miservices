import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getDocumentsSubcategoryCounts } from '@/lib/sanity';
import SubcategoryCards from './SubcategoryCards';

export const metadata: Metadata = {
  title: 'Documents | Members Area | miServices',
  description: 'Browse documents by subcategory.',
};

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  const subcategoryCounts = await getDocumentsSubcategoryCounts();

  return <SubcategoryCards subcategoryCounts={subcategoryCounts} />;
}
