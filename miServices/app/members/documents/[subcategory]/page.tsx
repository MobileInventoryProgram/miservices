import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMemberDocumentsByCategoryAndSubcategory } from '@/lib/sanity';
import SubcategoryDocuments from './SubcategoryDocuments';

const VALID_SUBCATEGORIES: Record<string, string> = {
  general: 'General',
  'operating-procedures': 'Operating Procedures',
  personnel: 'Personnel',
  training: 'Training',
};

interface SubcategoryPageProps {
  params: { subcategory: string };
}

export async function generateMetadata({ params }: SubcategoryPageProps): Promise<Metadata> {
  const title = VALID_SUBCATEGORIES[params.subcategory];
  if (!title) return {};
  return {
    title: `${title} | Documents | Members Area | miServices`,
  };
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const subcategoryTitle = VALID_SUBCATEGORIES[params.subcategory];

  if (!subcategoryTitle) {
    notFound();
  }

  const docs = await getMemberDocumentsByCategoryAndSubcategory('documents', params.subcategory);

  return (
    <SubcategoryDocuments
      subcategory={params.subcategory}
      subcategoryTitle={subcategoryTitle}
      documents={docs}
    />
  );
}
