import { Metadata } from 'next';
import SampleDocumentsContent, { type SampleDocumentsPageDoc } from './SampleDocumentsContent';
import { buildMetadata, getPageDoc } from '@/lib/cms/site';
import type { CmsSeo } from '@/lib/cms/types';

type Doc = SampleDocumentsPageDoc & { seo?: CmsSeo };
// The PDFs themselves stay private until a visitor fills in the form
const PROJECTION = `hero, cta, seo, documents[] { _key, name, title, description }`;

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getPageDoc<Doc>('sampleDocumentsPage', PROJECTION);
  return buildMetadata(doc?.seo, { title: doc?.hero?.heading, description: doc?.hero?.subheading, path: '/sample-documents' });
}

export default async function SampleDocumentsPage() {
  return <SampleDocumentsContent page={await getPageDoc<Doc>('sampleDocumentsPage', PROJECTION)} />;
}
