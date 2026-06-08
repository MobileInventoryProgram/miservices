import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'a4q9j3x1',
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

// Franchisee types
export interface SanityFranchiseeOwner {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePicture?: {
    asset: {
      _ref: string;
      url?: string;
    };
  };
}

export interface SanityFranchisee {
  _id: string;
  companyName: string;
  slug: string;
  territory: string;
  postCodes: string;
  townsCities: string;
  tags: string[];
  isActive: boolean;
  locationDescription?: any[];
  owners: SanityFranchiseeOwner[];
}

export interface TransformedFranchisee {
  id: string;
  companyName: string;
  slug: string;
  territory: string;
  postCodes: string;
  townsCities: string;
  tags: string[];
  profilePicture: string | null;
  locationDescription?: any[];
  owners: Array<{
    id: string;
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    phone: string;
    profilePicture: string | null;
  }>;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
}

// Franchisee GROQ fields
const franchiseeFields = `
  _id,
  companyName,
  "slug": slug.current,
  territory,
  postCodes,
  townsCities,
  tags,
  isActive,
  locationDescription,
  owners[] {
    firstName,
    lastName,
    email,
    phone,
    profilePicture {
      asset->{
        _ref,
        url
      }
    }
  }
`;

function transformFranchisee(doc: SanityFranchisee): TransformedFranchisee {
  const owners = (doc.owners || []).map((owner, index) => ({
    id: `${doc._id}-owner-${index}`,
    firstName: owner.firstName || '',
    lastName: owner.lastName || '',
    name: `${owner.firstName || ''} ${owner.lastName || ''}`.trim(),
    email: owner.email || '',
    phone: owner.phone || '',
    profilePicture: owner.profilePicture?.asset?.url || null,
  }));

  const firstOwner = owners[0];

  return {
    id: doc._id,
    companyName: doc.companyName || '',
    slug: doc.slug || '',
    territory: doc.territory || '',
    postCodes: doc.postCodes || '',
    townsCities: doc.townsCities || '',
    tags: doc.tags || [],
    profilePicture: firstOwner?.profilePicture || null,
    locationDescription: doc.locationDescription,
    owners,
    firstName: firstOwner?.firstName || '',
    lastName: firstOwner?.lastName || '',
    name: firstOwner?.name || '',
    email: firstOwner?.email || '',
    phone: firstOwner?.phone || '',
  };
}

// Franchisee functions
export async function getFranchisees(): Promise<TransformedFranchisee[]> {
  try {
    const docs: SanityFranchisee[] = await sanityClient.fetch(
      `*[_type == "franchisee" && isActive == true] | order(territory asc) {
        ${franchiseeFields}
      }`
    );
    return docs.map(transformFranchisee);
  } catch (error) {
    console.error('Error fetching franchisees:', error);
    return [];
  }
}

export async function getFranchiseeBySlug(slug: string): Promise<TransformedFranchisee | null> {
  try {
    const doc: SanityFranchisee | null = await sanityClient.fetch(
      `*[_type == "franchisee" && slug.current == $slug && isActive == true][0] {
        ${franchiseeFields}
      }`,
      { slug }
    );
    if (!doc) return null;
    return transformFranchisee(doc);
  } catch (error) {
    console.error('Error fetching franchisee:', error);
    return null;
  }
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

// ─── Members Area ───────────────────────────────────────────────

// Authenticated write client for mutations
export const sanityWriteClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'a4q9j3x1',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// Member types
export interface SanityMember {
  _id: string;
  email: string;
  name?: string;
  hashedPassword: string;
  role: 'franchisee' | 'admin';
  territory?: string;
  isActive: boolean;
  resetToken?: string;
  resetTokenExpiry?: string;
}

export interface SanityMemberDocument {
  _id: string;
  title: string;
  slug: string;
  category: 'documents' | 'pricing' | 'assets' | 'contacts' | 'quoting';
  subcategory?: 'general' | 'operating-procedures' | 'personnel' | 'training';
  description?: string;
  file?: {
    asset: {
      _ref: string;
      url: string;
    };
  };
  body?: any[];
  publishedAt: string;
  isPublished: boolean;
  order: number;
}

// Member queries
export async function getMemberByEmail(email: string): Promise<SanityMember | null> {
  try {
    const member = await sanityWriteClient.fetch(
      `*[_type == "member" && email == $email && isActive == true][0] {
        _id,
        email,
        name,
        hashedPassword,
        role,
        territory,
        isActive,
        resetToken,
        resetTokenExpiry
      }`,
      { email }
    );
    return member;
  } catch (error) {
    console.error('Error fetching member by email:', error);
    return null;
  }
}

export async function getMemberByResetToken(token: string): Promise<SanityMember | null> {
  try {
    const member = await sanityWriteClient.fetch(
      `*[_type == "member" && resetToken == $resetToken && isActive == true][0] {
        _id,
        email,
        name,
        hashedPassword,
        role,
        territory,
        isActive,
        resetToken,
        resetTokenExpiry
      }`,
      { resetToken: token }
    );
    return member;
  } catch (error) {
    console.error('Error fetching member by reset token:', error);
    return null;
  }
}

// Document queries
const memberDocFields = `
  _id,
  title,
  "slug": slug.current,
  category,
  subcategory,
  description,
  file {
    asset->{
      _ref,
      url
    }
  },
  body,
  publishedAt,
  isPublished,
  order
`;

export async function getMemberDocuments(): Promise<SanityMemberDocument[]> {
  try {
    const docs = await sanityClient.fetch(
      `*[_type == "memberDocument" && isPublished == true] | order(order asc, publishedAt desc) {
        ${memberDocFields}
      }`
    );
    return docs;
  } catch (error) {
    console.error('Error fetching member documents:', error);
    return [];
  }
}

export async function getMemberDocumentsByCategory(
  category: string
): Promise<SanityMemberDocument[]> {
  try {
    const docs = await sanityClient.fetch(
      `*[_type == "memberDocument" && isPublished == true && category == $category] | order(order asc, publishedAt desc) {
        ${memberDocFields}
      }`,
      { category }
    );
    return docs;
  } catch (error) {
    console.error('Error fetching member documents by category:', error);
    return [];
  }
}

export async function getMemberDocumentBySlug(
  slug: string
): Promise<SanityMemberDocument | null> {
  try {
    const doc = await sanityClient.fetch(
      `*[_type == "memberDocument" && slug.current == $slug && isPublished == true][0] {
        ${memberDocFields}
      }`,
      { slug }
    );
    return doc;
  } catch (error) {
    console.error('Error fetching member document by slug:', error);
    return null;
  }
}

export async function getMemberDocumentsByCategoryAndSubcategory(
  category: string,
  subcategory: string
): Promise<SanityMemberDocument[]> {
  try {
    const docs = await sanityClient.fetch(
      `*[_type == "memberDocument" && isPublished == true && category == $category && subcategory == $subcategory] | order(order asc, publishedAt desc) {
        ${memberDocFields}
      }`,
      { category, subcategory }
    );
    return docs;
  } catch (error) {
    console.error('Error fetching member documents by category and subcategory:', error);
    return [];
  }
}

export async function getDocumentsSubcategoryCounts(): Promise<Record<string, number>> {
  try {
    const docs = await sanityClient.fetch(
      `*[_type == "memberDocument" && isPublished == true && category == "documents"] { subcategory }`
    );
    const counts: Record<string, number> = {};
    for (const doc of docs) {
      if (doc.subcategory) {
        counts[doc.subcategory] = (counts[doc.subcategory] || 0) + 1;
      }
    }
    return counts;
  } catch (error) {
    console.error('Error fetching documents subcategory counts:', error);
    return {};
  }
}

export async function getFranchiseeByTerritory(
  territory: string
): Promise<SanityFranchisee | null> {
  try {
    const doc = await sanityClient.fetch(
      `*[_type == "franchisee" && territory == $territory && isActive == true][0] {
        ${franchiseeFields}
      }`,
      { territory }
    );
    return doc;
  } catch (error) {
    console.error('Error fetching franchisee by territory:', error);
    return null;
  }
}
