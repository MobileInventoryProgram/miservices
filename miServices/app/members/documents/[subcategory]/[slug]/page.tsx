import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMemberDocumentBySlug } from '@/lib/sanity';
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
    title: `${doc.title} | Members Area | miServices`,
  };
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  if (!VALID_SUBCATEGORIES[params.subcategory]) {
    notFound();
  }

  const doc = await getMemberDocumentBySlug(params.slug);

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
