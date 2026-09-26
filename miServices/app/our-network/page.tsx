import { Metadata } from 'next';
import NetworkDirectory, { type NetworkFranchise, type OurNetworkPageDoc } from './NetworkDirectory';
import { buildMetadata, getPageDoc, getSiteSettings } from '@/lib/cms/site';
import type { CmsSeo } from '@/lib/cms/types';
import { getFranchisees, urlFor } from '@/lib/sanity';
import { getNetworkGeo } from '@/lib/network/geo';

type Doc = OurNetworkPageDoc & { seo?: CmsSeo };
const PROJECTION = 'hero, searchPlaceholder, nearMeLabel, countLine, nearestHeading, regions, noResults, headOffice, seo';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobileinventoryservices.co.uk';

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getPageDoc<Doc>('ourNetworkPage', PROJECTION);
  return buildMetadata(doc?.seo, { title: doc?.hero?.heading, description: doc?.hero?.subheading, path: '/our-network' });
}

/** Every branch as a local business, so search engines connect each area to its branch page */
function networkJsonLd(franchises: NetworkFranchise[], site: { siteName: string; phone?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: site.siteName || 'miServices',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    ...(site.phone ? { telephone: site.phone } : {}),
    department: franchises.map((f) => ({
      '@type': 'LocalBusiness',
      '@id': `${BASE_URL}/our-network/${f.slug}`,
      name: `miServices ${f.territory}`,
      url: `${BASE_URL}/our-network/${f.slug}`,
      ...(f.owners[0]?.phone ? { telephone: f.owners[0].phone } : {}),
      ...(f.areaImage?.asset?._ref ? { image: urlFor(f.areaImage).width(1200).height(630).fit('crop').url() } : {}),
      ...(f.geo
        ? {
            geo: { '@type': 'GeoCoordinates', latitude: +f.geo.pin[1].toFixed(4), longitude: +f.geo.pin[0].toFixed(4) },
            address: { '@type': 'PostalAddress', ...(f.geo.town ? { addressLocality: f.geo.town } : {}), addressRegion: f.geo.region, addressCountry: 'GB' },
          }
        : {}),
      areaServed: (f.townsCities || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 25)
        .map((name) => ({ '@type': 'City', name })),
    })),
  };
}

export default async function OurNetworkPage() {
  const [page, franchisees, site] = await Promise.all([getPageDoc<Doc>('ourNetworkPage', PROJECTION), getFranchisees(), getSiteSettings()]);
  const geo = await getNetworkGeo(franchisees);

  // Only what the page needs goes to the browser
  const franchises: NetworkFranchise[] = franchisees.map((f) => ({
    id: f.id,
    slug: f.slug,
    companyName: f.companyName,
    territory: f.territory,
    postCodes: f.postCodes,
    townsCities: f.townsCities,
    areaImage: f.areaImage,
    owners: f.owners.map((o) => ({ id: o.id, name: o.name, firstName: o.firstName, lastName: o.lastName, email: o.email, phone: o.phone })),
    geo: geo[f.slug] || null,
  }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(networkJsonLd(franchises, site)) }} />
      <NetworkDirectory page={page} franchises={franchises} />
    </>
  );
}
