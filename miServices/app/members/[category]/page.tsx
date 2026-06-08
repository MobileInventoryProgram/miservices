import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMemberDocumentsByCategory } from '@/lib/sanity';
import CategoryDocuments from './CategoryDocuments';

const VALID_CATEGORIES: Record<string, string> = {
  pricing: 'Pricing',
  assets: 'Assets',
  contacts: 'Contacts',
  quoting: 'Quoting',
};

interface CategoryPageProps {
  params: { category: string };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const title = VALID_CATEGORIES[params.category];
  if (!title) return {};
  return {
    title: `${title} | Members Area | miServices`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categoryTitle = VALID_CATEGORIES[params.category];

  if (!categoryTitle) {
    notFound();
  }

  const docs = await getMemberDocumentsByCategory(params.category);

  return (
    <CategoryDocuments
      category={params.category}
      categoryTitle={categoryTitle}
      documents={docs}
    />
  );
}
