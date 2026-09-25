import { Metadata } from 'next';
import FranchiseContent, { type FranchisePageDoc } from './FranchiseContent';
import { buildMetadata, getPageDoc } from '@/lib/cms/site';

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getPageDoc<FranchisePageDoc>('franchisePage');
  return buildMetadata(doc?.seo, { title: doc?.hero?.heading, description: doc?.heroText, path: '/franchise' });
}

export default async function FranchisePage() {
  return <FranchiseContent doc={await getPageDoc<FranchisePageDoc>('franchisePage')} />;
}
