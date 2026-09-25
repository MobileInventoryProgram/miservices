import 'server-only';
import { cache } from 'react';
import type { Metadata } from 'next';
import { sanityClient } from '@/lib/sanity';
import { urlFor } from '@/lib/sanity-image';
import type { CmsImage, CmsSeo, SiteSettings } from './types';

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobileinventoryservices.co.uk';

/** Site Settings (one per request) */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const doc = await sanityClient
    .fetch<SiteSettings | null>(
      `*[_id == "siteSettings"][0] {
        ...,
        "footerLocations": footerLocations[] { _key, label, "slug": franchisee->slug.current, "name": franchisee->companyName }
      }`
    )
    .catch(() => null);
  return doc || { siteName: 'miServices' };
});

/** A website page singleton (e.g. "homePage") */
export async function getPageDoc<T>(id: string, projection = '...'): Promise<T | null> {
  return sanityClient.fetch<T | null>(`*[_id == $id][0] { ${projection} }`, { id }).catch(() => null);
}

export const imageUrl = (image?: CmsImage | null, width = 1600) =>
  image?.asset?._ref ? urlFor(image).width(width).auto('format').url() : undefined;

/**
 * Page metadata from the page's SEO fields, falling back to the page's own
 * heading/summary and then the Site Settings defaults.
 */
export async function buildMetadata(
  seo: CmsSeo | undefined | null,
  fallback: { title?: string; description?: string; path: string; image?: CmsImage | null }
): Promise<Metadata> {
  const site = await getSiteSettings();
  const title = seo?.metaTitle || (fallback.title ? `${fallback.title}${site.titleSuffix || ''}` : site.defaultTitle || site.siteName);
  const description = seo?.metaDescription || fallback.description || site.defaultDescription;
  const image = imageUrl(seo?.ogImage || fallback.image || site.defaultShareImage, 1200);
  const url = `${BASE_URL}${fallback.path}`;
  return {
    title,
    description,
    keywords: seo?.keywords || site.defaultKeywords,
    alternates: { canonical: url },
    robots: seo?.noIndex ? { index: false, follow: false } : undefined,
    openGraph: { title, description, url, siteName: site.siteName, type: 'website', locale: 'en_GB', ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}) },
    twitter: { card: 'summary_large_image', title, description, ...(image ? { images: [image] } : {}) },
  };
}

/** "0345 680 7976" → "tel:03456807976" */
export const telHref = (phone?: string) => (phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : undefined);
