import { Metadata } from 'next';
import NetworkDirectory, { type OurNetworkPageDoc } from './NetworkDirectory';
import { buildMetadata, getPageDoc } from '@/lib/cms/site';
import type { CmsSeo } from '@/lib/cms/types';

type Doc = OurNetworkPageDoc & { seo?: CmsSeo };
const PROJECTION = 'hero, searchPlaceholder, noResults, headOffice, seo';

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getPageDoc<Doc>('ourNetworkPage', PROJECTION);
  return buildMetadata(doc?.seo, { title: doc?.hero?.heading, description: doc?.hero?.subheading, path: '/our-network' });
}

export default async function OurNetworkPage() {
  return <NetworkDirectory page={await getPageDoc<Doc>('ourNetworkPage', PROJECTION)} />;
}
