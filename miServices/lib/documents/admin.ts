import 'server-only';
import { sanityWriteClient } from '@/lib/sanity';
import type { DocBlock } from '@/lib/documents/standard';

/**
 * Head Office document editing: reads both the published document and any
 * draft (Sanity keeps drafts as "drafts.<id>"). Members only ever read
 * published documents, through lib/sanity.ts.
 */
export interface EditableDocument {
  _id: string;
  _rev: string;
  title: string;
  slug: string;
  category: string;
  subcategory?: string;
  description?: string;
  order?: number;
  numberHeadings?: boolean;
  isPublished?: boolean;
  publishedAt?: string;
  _updatedAt: string;
  body?: DocBlock[];
}

const fields = `_id, _rev, _updatedAt, title, "slug": slug.current, category, "subcategory": coalesce(section->slug.current, subcategory), description, order, numberHeadings, isPublished, publishedAt, body`;

export const publishedId = (id: string) => id.replace(/^drafts\./, '');
export const draftId = (id: string) => `drafts.${publishedId(id)}`;
export const isValidDocId = (id: string) => /^[A-Za-z0-9_-][A-Za-z0-9._-]{0,127}$/.test(id) && !id.startsWith('drafts.');

/** The published document and draft for a slug (either may be missing) */
export async function getDocumentForEditing(slug: string): Promise<{ id: string; published: EditableDocument | null; draft: EditableDocument | null } | null> {
  const docs = await sanityWriteClient.fetch<EditableDocument[]>(`*[_type == "memberDocument" && slug.current == $slug] { ${fields} }`, { slug });
  if (!docs.length) return null;
  const published = docs.find((d) => !d._id.startsWith('drafts.')) || null;
  const draft = docs.find((d) => d._id.startsWith('drafts.')) || null;
  return { id: publishedId((published || draft)!._id), published, draft };
}

export async function getEditableById(id: string): Promise<{ published: EditableDocument | null; draft: EditableDocument | null }> {
  const docs = await sanityWriteClient.fetch<EditableDocument[]>(`*[_id in [$id, $draft]] { ${fields} }`, { id, draft: draftId(id) });
  return {
    published: docs.find((d) => d._id === id) || null,
    draft: docs.find((d) => d._id === draftId(id)) || null,
  };
}

/** For admins' document lists: which documents have unpublished changes, and drafts not yet published */
export async function getDraftSummary(subcategory: string): Promise<{
  draftIds: string[];
  unpublished: { _id: string; title: string; slug: string; description?: string; _updatedAt: string }[];
  hidden: { _id: string; title: string; slug: string; description?: string; _updatedAt: string }[];
}> {
  const drafts = await sanityWriteClient.fetch<{ _id: string; title: string; slug: string; description?: string; _updatedAt: string; hasPublished: boolean }[]>(
    `*[_type == "memberDocument" && _id in path("drafts.**") && category == "documents" && coalesce(section->slug.current, subcategory) == $subcategory] {
      _id, title, "slug": slug.current, description, _updatedAt,
      "hasPublished": count(*[_id == string::split(^._id, "drafts.")[1]]) > 0
    }`,
    { subcategory }
  );
  const hidden = await sanityWriteClient.fetch<{ _id: string; title: string; slug: string; description?: string; _updatedAt: string }[]>(
    `*[_type == "memberDocument" && !(_id in path("drafts.**")) && category == "documents" && coalesce(section->slug.current, subcategory) == $subcategory && isPublished == false] | order(order asc) { _id, title, "slug": slug.current, description, _updatedAt }`,
    { subcategory }
  );
  return {
    draftIds: drafts.filter((d) => d.hasPublished).map((d) => publishedId(d._id)),
    unpublished: drafts.filter((d) => !d.hasPublished).map((d) => ({ ...d, _id: publishedId(d._id) })),
    hidden,
  };
}
