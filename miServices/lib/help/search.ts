import 'server-only';
import { headingAnchor } from '@/lib/documents/standard';
import { sanityLiveClient } from '@/lib/sanity';
import { answerPlainText } from './markup';
import type { HelpArticle } from './articles';

/**
 * Help Centre search: plain keyword matching over the answers and every
 * section of the Members Area documents. No AI: the words typed are matched
 * (with simple plural/tense endings) and the best matches ranked.
 */

// ─── Document sections ──────────────────────────────────────────

export interface DocSection {
  documentId: string;
  documentTitle: string;
  /** Section title, e.g. "Holidays › Booking holiday" (null = the start of the document) */
  heading: string | null;
  headingKey: string | null;
  level: 2 | 3 | null;
  href: string;
  text: string;
}

type Block = {
  _type: string;
  _key: string;
  style?: string;
  children?: { text?: string }[];
  rows?: { cells?: unknown[] }[];
  people?: { name?: string; role?: string; phone?: string; email?: string }[];
  caption?: string;
};
type RawDoc = { _id: string; title: string; slug: string; section: string; body?: Block[] };

function blockText(block: Block): string {
  if (block._type === 'block') return (block.children || []).map((c) => c.text || '').join('');
  if (block._type === 'contacts') return (block.people || []).map((p) => [p.name, p.role, p.phone, p.email].filter(Boolean).join(' ')).join('. ');
  if (block.rows) {
    return block.rows
      .map((r) => (r.cells || []).map((c) => (typeof c === 'string' ? c : (c as { text?: string })?.text || '')).join(' '))
      .join('. ');
  }
  return block.caption || '';
}

/** Split each document at its Section/Subsection headings */
function splitSections(doc: RawDoc): DocSection[] {
  const base = `/members/documents/${doc.section}/${doc.slug}`;
  const sections: DocSection[] = [];
  let current: DocSection = { documentId: doc._id, documentTitle: doc.title, heading: null, headingKey: null, level: null, href: base, text: '' };
  let parent: string | null = null;

  for (const block of doc.body || []) {
    const isHeading = block._type === 'block' && (block.style === 'h2' || block.style === 'h3');
    if (isHeading) {
      if (current.text.trim() || current.heading) sections.push(current);
      const title = blockText(block).trim();
      const level = block.style === 'h2' ? 2 : 3;
      if (level === 2) parent = title;
      current = {
        documentId: doc._id,
        documentTitle: doc.title,
        heading: level === 3 && parent ? `${parent} › ${title}` : title,
        headingKey: block._key,
        level,
        href: `${base}#${headingAnchor(block._key)}`,
        text: '',
      };
      continue;
    }
    const text = blockText(block).trim();
    if (text) current.text += (current.text ? ' ' : '') + text;
  }
  if (current.text.trim() || current.heading) sections.push(current);
  return sections;
}

export interface DocOutline {
  id: string;
  title: string;
  headings: { key: string; text: string; level: 2 | 3 }[];
}

interface DocIndex {
  sections: DocSection[];
  outlines: DocOutline[];
}

const CACHE_MS = 5 * 60 * 1000;
const store = globalThis as typeof globalThis & { __helpDocIndex?: { at: number; data: Promise<DocIndex> } };

/** Every published Members Area document, split into sections (cached for a few minutes) */
export function getDocumentIndex(): Promise<DocIndex> {
  const hit = store.__helpDocIndex;
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.data;

  const data = sanityLiveClient
    .fetch<RawDoc[]>(
      `*[_type == "memberDocument" && isPublished == true && category == "documents" && defined(slug.current)] | order(title asc) {
        _id, title, "slug": slug.current, "section": coalesce(section->slug.current, subcategory), body
      }`
    )
    .then((docs) => {
      const valid = docs.filter((d) => d.section);
      return {
        sections: valid.flatMap(splitSections),
        outlines: valid.map((d) => ({
          id: d._id,
          title: d.title,
          headings: (d.body || [])
            .filter((b) => b._type === 'block' && (b.style === 'h2' || b.style === 'h3'))
            .map((b) => ({ key: b._key, text: blockText(b).trim(), level: (b.style === 'h2' ? 2 : 3) as 2 | 3 }))
            .filter((h) => h.text),
        })),
      };
    });
  store.__helpDocIndex = { at: Date.now(), data };
  data.catch(() => {
    if (store.__helpDocIndex?.data === data) store.__helpDocIndex = undefined;
  });
  return data;
}

/** Forget the cached index (after documents change) */
export function clearDocumentIndex() {
  store.__helpDocIndex = undefined;
}

// ─── Matching ───────────────────────────────────────────────────

const STOP_WORDS = new Set(
  'a an and are as at be but by can could do does did for from had has have how i if in into is it its me my of on or our should so than that the their them then there these they this to up was we were what when where which who why will with would you your'.split(
    ' '
  )
);

/** Simple word stem so "holidays", "holiday's" and "holiday" match (and "checking", "checked", "check") */
export function stem(word: string): string {
  let w = word.toLowerCase().replace(/['’]s$/, '');
  if (w.length > 4 && w.endsWith('ies')) w = `${w.slice(0, -3)}y`;
  else if (w.length > 5 && w.endsWith('ing')) w = w.slice(0, -3);
  else if (w.length > 4 && w.endsWith('ed')) w = w.slice(0, -2);
  else if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) w = w.slice(0, -1);
  return w;
}

function words(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9£%]+(?:['’][a-z]+)?/g) || [];
}

/** The words that matter in a search */
export function queryTerms(query: string): string[] {
  const all = words(query);
  const meaningful = all.filter((w) => !STOP_WORDS.has(w));
  return Array.from(new Set((meaningful.length ? meaningful : all).map(stem))).filter(Boolean);
}

function stemCounts(text: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const w of words(text)) {
    const s = stem(w);
    counts.set(s, (counts.get(s) || 0) + 1);
  }
  return counts;
}

interface Field {
  text: string;
  weight: number;
}

/** Score one item: title words count most, body mentions least; phrase and all-words bonuses */
function scoreItem(terms: string[], phrase: string, fields: Field[]): { score: number; matched: number } {
  let score = 0;
  const matchedTerms = new Set<string>();
  for (const field of fields) {
    if (!field.text) continue;
    const counts = stemCounts(field.text);
    for (const term of terms) {
      const n = counts.get(term) || 0;
      if (n) {
        matchedTerms.add(term);
        score += field.weight * Math.min(n, field.weight >= 5 ? 1 : 4);
      }
    }
    if (phrase.includes(' ') && field.text.toLowerCase().includes(phrase)) score += field.weight * 2;
  }
  if (terms.length > 1 && matchedTerms.size === terms.length) score += 8;
  return { score, matched: matchedTerms.size };
}

/** Enough of the search matched: one word, or at least half of several */
const enough = (matched: number, terms: number) => matched > 0 && matched >= Math.ceil(terms / 2);

/** Drop weak matches: anything scoring under a third of the best result */
function strongest<T extends { score: number }>(items: T[], limit: number): T[] {
  const sorted = [...items].sort((x, y) => y.score - x.score);
  const floor = (sorted[0]?.score || 0) / 3;
  return sorted.filter((r) => r.score >= floor).slice(0, limit);
}

export interface SnippetPart {
  text: string;
  hit: boolean;
}

/** A short extract around the first match, with the matched words marked */
function snippet(text: string, terms: string[], length = 200): SnippetPart[] {
  const tokens = Array.from(text.matchAll(/[A-Za-z0-9£%]+(?:['’][A-Za-z]+)?/g));
  const firstHit = tokens.find((t) => terms.includes(stem(t[0])));
  let start = firstHit ? Math.max(0, (firstHit.index || 0) - 60) : 0;
  if (start > 0) {
    const space = text.indexOf(' ', start);
    start = space > -1 && space < start + 20 ? space + 1 : start;
  }
  let end = Math.min(text.length, start + length);
  if (end < text.length) {
    const space = text.lastIndexOf(' ', end);
    end = space > start ? space : end;
  }
  const excerpt = text.slice(start, end);
  const parts: SnippetPart[] = [];
  let last = 0;
  for (const m of Array.from(excerpt.matchAll(/[A-Za-z0-9£%]+(?:['’][A-Za-z]+)?/g))) {
    if (!terms.includes(stem(m[0]))) continue;
    const at = m.index || 0;
    if (at > last) parts.push({ text: excerpt.slice(last, at), hit: false });
    parts.push({ text: m[0], hit: true });
    last = at + m[0].length;
  }
  if (last < excerpt.length) parts.push({ text: excerpt.slice(last), hit: false });
  if (start > 0) parts.unshift({ text: '…', hit: false });
  if (end < text.length) parts.push({ text: '…', hit: false });
  return parts;
}

// ─── Search ─────────────────────────────────────────────────────

export interface AnswerResult {
  slug: string;
  question: string;
  topic: string;
  preview: string;
}

export interface SectionResult {
  documentTitle: string;
  heading: string | null;
  href: string;
  snippet: SnippetPart[];
}

export interface HelpSearchResults {
  query: string;
  answers: AnswerResult[];
  sections: SectionResult[];
}

/** Search the answers and document sections a member can see */
export async function searchHelp(
  query: string,
  articles: HelpArticle[],
  visibleDocIds: Set<string> | null
): Promise<HelpSearchResults> {
  const terms = queryTerms(query);
  const phrase = words(query).join(' ');
  if (!terms.length) return { query, answers: [], sections: [] };

  const answers = articles
    .map((a) => {
      const text = answerPlainText(a.answer);
      const { score, matched } = scoreItem(terms, phrase, [
        { text: a.question, weight: 10 },
        { text: a.keywords.join(' '), weight: 6 },
        { text: a.sources.map((s) => s.headingText || s.documentTitle || '').join(' '), weight: 3 },
        { text, weight: 1 },
      ]);
      return { a, text, score, matched };
    })
    .filter((r) => enough(r.matched, terms.length));
  const topAnswers = strongest(answers, 5).map(({ a, text }) => ({ slug: a.slug, question: a.question, topic: a.topic, preview: text.length > 180 ? `${text.slice(0, 177).trimEnd()}…` : text }));

  const { sections: all } = await getDocumentIndex();
  const sections = all
    .filter((s) => !visibleDocIds || visibleDocIds.has(s.documentId))
    .map((s) => {
      const { score, matched } = scoreItem(terms, phrase, [
        { text: s.heading || '', weight: 10 },
        { text: s.documentTitle, weight: 3 },
        { text: s.text, weight: 1 },
      ]);
      return { s, score, matched };
    })
    .filter((r) => enough(r.matched, terms.length));
  const topSections = strongest(sections, 8).map(({ s }) => ({ documentTitle: s.documentTitle, heading: s.heading, href: s.href, snippet: snippet(s.text || s.heading || '', terms) }));

  return { query, answers: topAnswers, sections: topSections };
}
