import { Metadata } from 'next';
import AudiencePage, { type AudiencePageDoc } from '@/components/cms/AudiencePage';
import { buildMetadata, getPageDoc } from '@/lib/cms/site';

const ID = 'audience-lettings-agents';

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getPageDoc<AudiencePageDoc>(ID);
  return buildMetadata(doc?.seo, { title: doc?.hero?.heading, description: doc?.hero?.subheading, path: '/lettings-agents' });
}

export default async function Page() {
  return <AudiencePage doc={await getPageDoc<AudiencePageDoc>(ID)} />;
}
