import { Metadata } from 'next';
import PricingContent, { type PricingPageDoc } from './PricingContent';
import { buildMetadata, getPageDoc } from '@/lib/cms/site';
import type { CmsSeo } from '@/lib/cms/types';

type Doc = PricingPageDoc & { seo?: CmsSeo };

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getPageDoc<Doc>('pricingPage');
  return buildMetadata(doc?.seo, { title: doc?.hero?.heading, description: doc?.hero?.subheading, path: '/pricing' });
}

export default async function PricingPage() {
  return <PricingContent doc={await getPageDoc<Doc>('pricingPage')} />;
}
