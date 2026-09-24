import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url';
import { DEFAULT_FLYER_SETTINGS, type FlyerSettings } from '@/lib/flyer/data';

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

export interface SanityTestimonial {
  _key?: string;
  clientName: string;
  clientRole?: string;
  quote: string;
  rating?: number;
}

export interface SanityQualifications {
  yearsExperience?: number;
  dbsChecked?: boolean;
  certifications?: string[];
  additionalInfo?: string;
}

export interface SanityTeamMember {
  _key?: string;
  name: string;
  role?: string;
  bio?: string;
  photo?: {
    asset: {
      _ref: string;
      url?: string;
    };
  };
}

export interface SanityHighlightedService {
  _key?: string;
  serviceSlug?: string;
  customServiceName?: string;
  description?: string;
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
  testimonials?: SanityTestimonial[];
  qualifications?: SanityQualifications;
  teamMembers?: SanityTeamMember[];
  highlightedServices?: SanityHighlightedService[];
}

export interface TransformedTestimonial {
  key: string;
  clientName: string;
  clientRole: string;
  quote: string;
  rating: number;
}

export interface TransformedTeamMember {
  key: string;
  name: string;
  role: string;
  bio: string;
  photo: string | null;
}

export interface TransformedHighlightedService {
  key: string;
  serviceSlug: string;
  customServiceName: string;
  description: string;
}

export interface TransformedQualifications {
  yearsExperience: number | null;
  dbsChecked: boolean;
  certifications: string[];
  additionalInfo: string;
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
  testimonials: TransformedTestimonial[];
  qualifications: TransformedQualifications;
  teamMembers: TransformedTeamMember[];
  highlightedServices: TransformedHighlightedService[];
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
  },
  testimonials[] {
    _key,
    clientName,
    clientRole,
    quote,
    rating
  },
  qualifications {
    yearsExperience,
    dbsChecked,
    certifications,
    additionalInfo
  },
  teamMembers[] {
    _key,
    name,
    role,
    bio,
    photo {
      asset->{
        _ref,
        url
      }
    }
  },
  highlightedServices[] {
    _key,
    serviceSlug,
    customServiceName,
    description
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

  const testimonials: TransformedTestimonial[] = (doc.testimonials || []).map((t, i) => ({
    key: t._key || `testimonial-${i}`,
    clientName: t.clientName || '',
    clientRole: t.clientRole || '',
    quote: t.quote || '',
    rating: t.rating ?? 5,
  }));

  const qualifications: TransformedQualifications = {
    yearsExperience: doc.qualifications?.yearsExperience ?? null,
    dbsChecked: doc.qualifications?.dbsChecked ?? false,
    certifications: doc.qualifications?.certifications || [],
    additionalInfo: doc.qualifications?.additionalInfo || '',
  };

  const teamMembers: TransformedTeamMember[] = (doc.teamMembers || []).map((tm, i) => ({
    key: tm._key || `team-${i}`,
    name: tm.name || '',
    role: tm.role || '',
    bio: tm.bio || '',
    photo: tm.photo?.asset?.url || null,
  }));

  const highlightedServices: TransformedHighlightedService[] = (doc.highlightedServices || []).map((hs, i) => ({
    key: hs._key || `service-${i}`,
    serviceSlug: hs.serviceSlug || '',
    customServiceName: hs.customServiceName || '',
    description: hs.description || '',
  }));

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
    testimonials,
    qualifications,
    teamMembers,
    highlightedServices,
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
  franchiseeId?: string;
  territory?: string;
  isActive: boolean;
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
  targetFranchisees?: Array<{ _ref: string }>;
  targetMembers?: Array<{ _ref: string }>;
}

export interface DocumentTargetingParams {
  memberId: string;
  franchiseeId: string | null;
  role: 'franchisee' | 'admin';
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
        "franchiseeId": franchisee->._id,
        territory,
        isActive
      }`,
      { email }
    );
    return member;
  } catch (error) {
    console.error('Error fetching member by email:', error);
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
  order,
  targetFranchisees,
  targetMembers
`;

// GROQ filter for document targeting. Admins see everything.
// Franchisees see: untargeted docs + docs targeted to their franchisee or member account.
function buildTargetingFilter(params?: DocumentTargetingParams): {
  filter: string;
  queryParams: Record<string, string>;
} {
  if (!params || params.role === 'admin') {
    return { filter: '', queryParams: {} };
  }
  const filter = ` && (
    ((!defined(targetFranchisees) || length(targetFranchisees) == 0)
      && (!defined(targetMembers) || length(targetMembers) == 0))
    || $franchiseeId in targetFranchisees[]._ref
    || $memberId in targetMembers[]._ref
  )`;
  return {
    filter,
    queryParams: {
      franchiseeId: params.franchiseeId || '',
      memberId: params.memberId,
    },
  };
}

export async function getMemberDocuments(
  params?: DocumentTargetingParams
): Promise<SanityMemberDocument[]> {
  try {
    const { filter, queryParams } = buildTargetingFilter(params);
    const docs = await sanityClient.fetch(
      `*[_type == "memberDocument" && isPublished == true${filter}] | order(order asc, publishedAt desc) {
        ${memberDocFields}
      }`,
      queryParams
    );
    return docs;
  } catch (error) {
    console.error('Error fetching member documents:', error);
    return [];
  }
}

export async function getMemberDocumentsByCategory(
  category: string,
  params?: DocumentTargetingParams
): Promise<SanityMemberDocument[]> {
  try {
    const { filter, queryParams } = buildTargetingFilter(params);
    const docs = await sanityClient.fetch(
      `*[_type == "memberDocument" && isPublished == true && category == $category${filter}] | order(order asc, publishedAt desc) {
        ${memberDocFields}
      }`,
      { category, ...queryParams }
    );
    return docs;
  } catch (error) {
    console.error('Error fetching member documents by category:', error);
    return [];
  }
}

export async function getMemberDocumentBySlug(
  slug: string,
  params?: DocumentTargetingParams
): Promise<SanityMemberDocument | null> {
  try {
    const { filter, queryParams } = buildTargetingFilter(params);
    const doc = await sanityClient.fetch(
      `*[_type == "memberDocument" && slug.current == $slug && isPublished == true${filter}][0] {
        ${memberDocFields}
      }`,
      { slug, ...queryParams }
    );
    return doc;
  } catch (error) {
    console.error('Error fetching member document by slug:', error);
    return null;
  }
}

export async function getMemberDocumentsByCategoryAndSubcategory(
  category: string,
  subcategory: string,
  params?: DocumentTargetingParams
): Promise<SanityMemberDocument[]> {
  try {
    const { filter, queryParams } = buildTargetingFilter(params);
    const docs = await sanityClient.fetch(
      `*[_type == "memberDocument" && isPublished == true && category == $category && subcategory == $subcategory${filter}] | order(order asc, publishedAt desc) {
        ${memberDocFields}
      }`,
      { category, subcategory, ...queryParams }
    );
    return docs;
  } catch (error) {
    console.error('Error fetching member documents by category and subcategory:', error);
    return [];
  }
}

export async function getDocumentsSubcategoryCounts(
  params?: DocumentTargetingParams
): Promise<Record<string, number>> {
  try {
    const { filter, queryParams } = buildTargetingFilter(params);
    const docs = await sanityClient.fetch(
      `*[_type == "memberDocument" && isPublished == true && category == "documents"${filter}] { subcategory }`,
      queryParams
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

/**
 * Resolve the franchisee for the current session.
 * Prefers the direct franchisee reference; falls back to territory string lookup.
 */
export async function getFranchiseeForSession(session: {
  user: { franchiseeId?: string | null; territory?: string | null };
}): Promise<SanityFranchisee | null> {
  if (session.user.franchiseeId) {
    try {
      const doc: SanityFranchisee | null = await sanityClient.fetch(
        `*[_type == "franchisee" && _id == $id && isActive == true][0] {
          ${franchiseeFields}
        }`,
        { id: session.user.franchiseeId }
      );
      if (doc) return doc;
    } catch (error) {
      console.error('Error fetching franchisee by reference:', error);
    }
  }

  if (session.user.territory) {
    return getFranchiseeByTerritory(session.user.territory);
  }

  return null;
}

// ─── Pricing ────────────────────────────────────────────────────

export interface SanityServiceRow {
  _key: string;
  serviceType: 'inventory' | 'combined' | 'checkout' | 'midterm' | 'checkin' | 'virtualTourBundle' | 'virtualTourFloorplan' | 'floorplan';
  bedrooms: 'studio_1' | '2' | '3' | '4' | '5' | '6';
  maxRooms: number;
  unfurnishedPrice: number;
  furnishedPrice?: number;
}

export interface SanityFlatRate {
  _key: string;
  name: string;
  price: number;
  unit?: string;
}

export interface SanityAdditionalRoomRates {
  unfurnishedPerRoom: number;
  furnishedPerRoom: number;
}

export interface SanityPriceList {
  _id: string;
  title: string;
  isDefault: boolean;
  owner?: { _ref: string } | null;
  availableToFranchisees?: boolean;
  serviceRows?: SanityServiceRow[];
  flatRates: SanityFlatRate[];
  additionalRoomRates?: SanityAdditionalRoomRates;
  cancellationFee?: number;
  terms?: any[];
  ownerRef?: string | null;
  flyerNote?: string | null;
  shareEnabled?: boolean;
  shareToken?: string | null;
}

export interface SanityPriceListSummary {
  _id: string;
  title: string;
  isDefault: boolean;
  isOwned: boolean;
  shareEnabled?: boolean;
  shareToken?: string | null;
}

const priceListFields = `
  _id,
  title,
  isDefault,
  "ownerRef": owner._ref,
  availableToFranchisees,
  serviceRows[] {
    _key,
    serviceType,
    bedrooms,
    maxRooms,
    unfurnishedPrice,
    furnishedPrice
  },
  flatRates[] {
    _key,
    name,
    price,
    unit
  },
  additionalRoomRates {
    unfurnishedPerRoom,
    furnishedPerRoom
  },
  cancellationFee,
  terms,
  flyerNote,
  shareEnabled,
  shareToken
`;

/**
 * All lists a franchisee can see: their own private lists + shared admin templates.
 */
export async function getPriceListsForFranchisee(
  franchiseeId: string
): Promise<(SanityPriceListSummary & { isOwned: boolean })[]> {
  try {
    const docs = await sanityClient.fetch(
      `*[_type == "priceList" && (
        owner._ref == $franchiseeId ||
        (!defined(owner) && availableToFranchisees == true)
      )] | order(title asc) {
        _id,
        title,
        isDefault,
        "isOwned": defined(owner),
        shareEnabled,
        shareToken
      }`,
      { franchiseeId }
    );
    return docs;
  } catch (error) {
    console.error('Error fetching price lists for franchisee:', error);
    return [];
  }
}

/**
 * Admin templates available for duplication.
 */
export async function getSharedTemplates(): Promise<SanityPriceList[]> {
  try {
    const docs = await sanityClient.fetch(
      `*[_type == "priceList" && !defined(owner) && availableToFranchisees == true] | order(title asc) {
        ${priceListFields}
      }`
    );
    return docs;
  } catch (error) {
    console.error('Error fetching shared templates:', error);
    return [];
  }
}

/**
 * Single list, verified owned by this franchisee.
 */
export async function getOwnedPriceList(
  listId: string,
  franchiseeId: string
): Promise<SanityPriceList | null> {
  try {
    const doc = await sanityClient.fetch(
      `*[_type == "priceList" && _id == $listId && owner._ref == $franchiseeId][0] {
        ${priceListFields}
      }`,
      { listId, franchiseeId }
    );
    return doc;
  } catch (error) {
    console.error('Error fetching owned price list:', error);
    return null;
  }
}

/**
 * Any list visible to this franchisee (owned or shared template), for read-only viewing.
 */
export async function getVisiblePriceList(
  listId: string,
  franchiseeId: string
): Promise<SanityPriceList | null> {
  try {
    const doc = await sanityClient.fetch(
      `*[_type == "priceList" && _id == $listId && (
        owner._ref == $franchiseeId ||
        (!defined(owner) && availableToFranchisees == true)
      )][0] {
        ${priceListFields}
      }`,
      { listId, franchiseeId }
    );
    return doc;
  } catch (error) {
    console.error('Error fetching visible price list:', error);
    return null;
  }
}

/**
 * Franchisee's default list (for quoting pre-selection).
 */
export async function getFranchiseeDefaultList(
  franchiseeId: string
): Promise<SanityPriceList | null> {
  try {
    const doc = await sanityClient.fetch(
      `*[_type == "priceList" && owner._ref == $franchiseeId && isDefault == true][0] {
        ${priceListFields}
      }`,
      { franchiseeId }
    );
    return doc;
  } catch (error) {
    console.error('Error fetching franchisee default list:', error);
    return null;
  }
}

/**
 * All admin templates (for Studio / admin use).
 */
export async function getAdminPriceLists(): Promise<SanityPriceList[]> {
  try {
    const docs = await sanityClient.fetch(
      `*[_type == "priceList" && !defined(owner)] | order(title asc) {
        ${priceListFields}
      }`
    );
    return docs;
  } catch (error) {
    console.error('Error fetching admin price lists:', error);
    return [];
  }
}

/**
 * Any price list by ID, no ownership check. Admin-only.
 */
export async function getPriceListById(listId: string): Promise<SanityPriceList | null> {
  try {
    const doc = await sanityClient.fetch(
      `*[_type == "priceList" && _id == $listId][0] {
        ${priceListFields}
      }`,
      { listId }
    );
    return doc;
  } catch (error) {
    console.error('Error fetching price list by id:', error);
    return null;
  }
}

/**
 * Price list behind a public share link. Uses the uncached client so a link
 * works as soon as it's switched on and stops as soon as it's switched off.
 */
export async function getPriceListByShareToken(token: string): Promise<SanityPriceList | null> {
  try {
    const doc = await sanityWriteClient.fetch<SanityPriceList | null>(
      `*[_type == "priceList" && shareEnabled == true && shareToken == $shareToken][0] {
        ${priceListFields}
      }`,
      { shareToken: token }
    );
    return doc;
  } catch (error) {
    console.error('Error fetching price list by share token:', error);
    return null;
  }
}

/**
 * Flyer wording from Studio (Flyer Settings), laid over the leaflet defaults.
 */
export async function getFlyerSettings(): Promise<FlyerSettings> {
  try {
    const doc = await sanityClient.fetch<Partial<FlyerSettings> | null>(
      `*[_type == "flyerSettings" && _id == "flyerSettings"][0] {
        showOffer, offerEyebrow, offerHeadline, offerSmallPrint, introText,
        sellingPoints[] { prefix, highlight, detail },
        bookingPhone, bookingEmail, bookingUrl, websiteNote, vatNote
      }`
    );
    const settings = { ...DEFAULT_FLYER_SETTINGS };
    if (doc) {
      for (const [key, value] of Object.entries(doc)) {
        const isEmpty = value == null || value === '' || (Array.isArray(value) && value.length === 0);
        if (!isEmpty) (settings as Record<string, unknown>)[key] = value;
      }
    }
    return settings;
  } catch (error) {
    console.error('Error fetching flyer settings:', error);
    return DEFAULT_FLYER_SETTINGS;
  }
}

// ─── Admin Overview ─────────────────────────────────────────────

export interface AdminPriceListSummary {
  _id: string;
  title: string;
  isDefault: boolean;
  ownerName: string | null;
  ownerTerritory: string | null;
  isTemplate: boolean;
}

/**
 * All price lists across all franchisees and admin templates. Admin-only view.
 */
export async function getAllPriceLists(): Promise<AdminPriceListSummary[]> {
  try {
    const docs = await sanityClient.fetch(
      `*[_type == "priceList"] | order(title asc) {
        _id,
        title,
        isDefault,
        "ownerName": owner->companyName,
        "ownerTerritory": owner->territory,
        "isTemplate": !defined(owner)
      }`
    );
    return docs;
  } catch (error) {
    console.error('Error fetching all price lists:', error);
    return [];
  }
}
