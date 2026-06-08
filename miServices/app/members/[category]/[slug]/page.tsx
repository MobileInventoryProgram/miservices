import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMemberDocumentBySlug } from '@/lib/sanity';
import DocumentView from './DocumentView';

const VALID_CATEGORIES: Record<string, string> = {
  pricing: 'Pricing',
  assets: 'Assets',
  contacts: 'Contacts',
  quoting: 'Quoting',
};

interface DocumentPageProps {
  params: { category: string; slug: string };
}

export async function generateMetadata({ params }: DocumentPageProps): Promise<Metadata> {
  const doc = await getMemberDocumentBySlug(params.slug);
  if (!doc) return {};
  return {
    title: `${doc.title} | Members Area | miServices`,
  };
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  if (!VALID_CATEGORIES[params.category]) {
    notFound();
  }

  const doc = await getMemberDocumentBySlug(params.slug);

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
