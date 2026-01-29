import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'rg2gwvf1',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// Types
export interface SanityPost {
  _id: string;
  title: string;
  slug: string;
  body: any[]; // Portable Text
  featuredImage?: {
    asset: {
      _ref: string;
      url?: string;
    };
    alt?: string;
  };
  excerpt: string;
  publishedAt: string;
  readingTime?: number;
  tags?: Array<{
    _id: string;
    name: string;
    slug: string;
  }>;
  author?: {
    _id: string;
    name: string;
    image?: {
      asset: {
        _ref: string;
        url?: string;
      };
    };
  };
}

export interface SanityPage {
  _id: string;
  title: string;
  slug: string;
  body: any[]; // Portable Text
  featuredImage?: {
    asset: {
      _ref: string;
      url?: string;
    };
    alt?: string;
  };
  excerpt?: string;
  publishedAt: string;
  tags?: Array<{
    _id: string;
    name: string;
    slug: string;
  }>;
}

export interface SanityService {
  _id: string;
  title: string;
  slug: string;
  heroDescription: string;
  bodyHeading?: string;
  bodyIntro?: string;
  bodySubheading?: string;
  bodyText?: any[]; // Portable Text
  bodyImage?: {
    asset: {
      _ref: string;
      url?: string;
    };
    alt?: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
  };
}

// Queries
const postFields = `
  _id,
  title,
  "slug": slug.current,
  body,
  featuredImage {
    asset->{
      _ref,
      url
    },
    alt
  },
  excerpt,
  publishedAt,
  readingTime,
  tags[]->{
    _id,
    name,
    "slug": slug.current
  },
  author->{
    _id,
    name,
    image {
      asset->{
        _ref,
        url
      }
    }
  }
`;

const pageFields = `
  _id,
  title,
  "slug": slug.current,
  body,
  featuredImage {
    asset->{
      _ref,
      url
    },
    alt
  },
  excerpt,
  publishedAt,
  tags[]->{
    _id,
    name,
    "slug": slug.current
  }
`;

// Post functions
export async function getPosts(): Promise<SanityPost[]> {
  try {
    const posts = await sanityClient.fetch(
      `*[_type == "post"] | order(publishedAt desc) {
        ${postFields}
      }`
    );
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export async function getSinglePost(slug: string): Promise<SanityPost | null> {
  try {
    const post = await sanityClient.fetch(
      `*[_type == "post" && slug.current == $slug][0] {
        ${postFields}
      }`,
      { slug }
    );
    return post;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const slugs = await sanityClient.fetch(
      `*[_type == "post"].slug.current`
    );
    return slugs;
  } catch (error) {
    console.error('Error fetching slugs:', error);
    return [];
  }
}

export async function getPostsByTag(tagSlug: string): Promise<SanityPost[]> {
  try {
    const posts = await sanityClient.fetch(
      `*[_type == "post" && $tagSlug in tags[]->slug.current] | order(publishedAt asc) {
        ${postFields}
      }`,
      { tagSlug }
    );
    return posts;
  } catch (error) {
    console.error('Error fetching posts by tag:', error);
    return [];
  }
}

// Page functions
export async function getSinglePage(slug: string): Promise<SanityPage | null> {
  try {
    const page = await sanityClient.fetch(
      `*[_type == "page" && slug.current == $slug][0] {
        ${pageFields}
      }`,
      { slug }
    );
    return page;
  } catch (error) {
    console.error('Error fetching page:', error);
    return null;
  }
}

export async function getPagesByTag(tagSlug: string): Promise<SanityPage[]> {
  try {
    const pages = await sanityClient.fetch(
      `*[_type == "page" && $tagSlug in tags[]->slug.current] | order(publishedAt asc) {
        ${pageFields}
      }`,
      { tagSlug }
    );
    return pages;
  } catch (error) {
    console.error('Error fetching pages by tag:', error);
    return [];
  }
}

export async function getAllPageSlugs(): Promise<string[]> {
  try {
    const slugs = await sanityClient.fetch(
      `*[_type == "page"].slug.current`
    );
    return slugs;
  } catch (error) {
    console.error('Error fetching page slugs:', error);
    return [];
  }
}

// Helper to convert Portable Text to HTML (basic)
// For full rendering, use @portabletext/react in components
export function estimateReadingTime(body: any[]): number {
  if (!body) return 1;

  const text = body
    .filter((block: any) => block._type === 'block')
    .map((block: any) => block.children?.map((child: any) => child.text).join(' ') || '')
    .join(' ');

  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute) || 1;
}

// Service fields for queries
const serviceFields = `
  _id,
  title,
  "slug": slug.current,
  heroDescription,
  bodyHeading,
  bodyIntro,
  bodySubheading,
  bodyText,
  bodyImage {
    asset->{
      _ref,
      url
    },
    alt
  },
  seo
`;

// Service functions
export async function getServices(): Promise<SanityService[]> {
  try {
    const services = await sanityClient.fetch(
      `*[_type == "service"] | order(title asc) {
        ${serviceFields}
      }`
    );
    return services;
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

export async function getServiceBySlug(slug: string): Promise<SanityService | null> {
  try {
    const service = await sanityClient.fetch(
      `*[_type == "service" && slug.current == $slug][0] {
        ${serviceFields}
      }`,
      { slug }
    );
    return service;
  } catch (error) {
    console.error('Error fetching service:', error);
    return null;
  }
}

export async function getAllServiceSlugs(): Promise<string[]> {
  try {
    const slugs = await sanityClient.fetch(
      `*[_type == "service"].slug.current`
    );
    return slugs;
  } catch (error) {
    console.error('Error fetching service slugs:', error);
    return [];
  }
}
