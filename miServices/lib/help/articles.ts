import 'server-only';
import { headingAnchor } from '@/lib/documents/standard';
import { sanityWriteClient } from '@/lib/sanity';
import type { AnswerBlock } from './markup';

/** A document section an answer comes from */
export interface HelpSource {
  _key: string;
  documentId: string | null;
  documentTitle: string | null;
  headingKey?: string;
  headingText?: string;
  /** Link to the document, at the section when there is one */
  href: string | null;
  /** Head Office: the linked document or section no longer exists or is unpublished */
  broken: boolean;
}

export interface HelpArticle {
  _id: string;
  /** Used in /members/help/<slug> */
  slug: string;
  question: string;
  answer: AnswerBlock[];
  topic: string;
  keywords: string[];
  order: number;
  isPublished: boolean;
  sources: HelpSource[];
  updatedAt: string;
}

const ID_PREFIX = 'helpArticle-';
export const articleIdFromSlug = (slug: string) => `${ID_PREFIX}${slug}`;
export const articleSlug = (id: string) => (id.startsWith(ID_PREFIX) ? id.slice(ID_PREFIX.length) : id);

type RawSource = {
  _key: string;
  headingKey?: string;
  headingText?: string;
  doc?: { _id: string; title: string; slug: string; section?: string; isPublished?: boolean; keys?: string[] } | null;
};
type RawArticle = Omit<HelpArticle, 'slug' | 'sources'> & { sources?: RawSource[] | null };

/**
 * Every answer, uncached so Head Office edits show straight away. Sources
 * resolve to their document and section links.
 */
export async function getAllHelpArticles(): Promise<HelpArticle[]> {
  const raw = await sanityWriteClient
    .fetch<RawArticle[]>(
      `*[_type == "helpArticle" && !(_id in path("drafts.**"))] | order(topic asc, coalesce(order, 999) asc, question asc) {
        _id, question, answer, topic, "keywords": coalesce(keywords, []), "order": coalesce(order, 999),
        "isPublished": coalesce(isPublished, true), "updatedAt": _updatedAt,
        sources[] {
          _key, headingKey, headingText,
          "doc": document->{
            _id, title, "slug": slug.current, "section": coalesce(section->slug.current, subcategory),
            isPublished, "keys": body[style in ["h2", "h3"]]._key
          }
        }
      }`
    )
    .catch((error) => {
      console.error('Error fetching help articles:', error);
      return [] as RawArticle[];
    });

  return raw.map((a) => ({
    ...a,
    slug: articleSlug(a._id),
    sources: (a.sources || []).map((s) => {
      const doc = s.doc;
      const headingMissing = !!s.headingKey && !(doc?.keys || []).includes(s.headingKey);
      const base = doc?.section && doc.slug ? `/members/documents/${doc.section}/${doc.slug}` : null;
      return {
        _key: s._key,
        documentId: doc?._id || null,
        documentTitle: doc?.title || null,
        headingKey: s.headingKey,
        headingText: s.headingText,
        href: base ? `${base}${s.headingKey && !headingMissing ? `#${headingAnchor(s.headingKey)}` : ''}` : null,
        broken: !doc || doc.isPublished === false || headingMissing,
      };
    }),
  }));
}

/**
 * What a member may see: published answers, with only the sources they can
 * open. An answer drawn only from documents they can't see is left out.
 * Head Office sees everything, including hidden answers and broken links.
 */
export function visibleArticles(articles: HelpArticle[], visibleDocIds: Set<string>, isAdmin: boolean): HelpArticle[] {
  if (isAdmin) return articles;
  return articles
    .filter((a) => a.isPublished)
    .flatMap((a) => {
      if (!a.sources.length) return [a]; // e.g. how to use the Members Area
      const sources = a.sources.filter((s) => !s.broken && s.documentId && visibleDocIds.has(s.documentId));
      return sources.length ? [{ ...a, sources }] : [];
    });
}
