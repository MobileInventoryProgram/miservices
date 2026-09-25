/**
 * The one standard every member document follows. Shared by the viewer, the
 * editor, validation, the Studio schema and the clean-up script, so the rules
 * live in one place. Client-safe.
 *
 * Content: paragraphs, Sections (h2) and Subsections (h3); bullet and numbered
 * lists up to two levels; bold, italic and links; images; tables; contact
 * cards. Heading
 * numbers (1, 1.1) are never typed — they're worked out from the structure
 * when a document has "Number headings" switched on.
 */

export const DOC_STYLES = [
  { name: 'normal', title: 'Paragraph' },
  { name: 'h2', title: 'Section' },
  { name: 'h3', title: 'Subsection' },
] as const;
export const DOC_LISTS = [
  { name: 'bullet', title: 'Bullets' },
  { name: 'number', title: 'Numbered' },
] as const;
export const DOC_DECORATORS = [
  { name: 'strong', title: 'Bold' },
  { name: 'em', title: 'Italic' },
] as const;
export const MAX_LIST_LEVEL = 2;

export type DocStyle = (typeof DOC_STYLES)[number]['name'];

export interface DocSpan {
  _type: 'span';
  _key: string;
  text: string;
  marks?: string[];
}
export interface DocTextBlock {
  _type: 'block';
  _key: string;
  style?: string;
  listItem?: string;
  level?: number;
  markDefs?: { _type: string; _key: string; href?: string }[];
  children: DocSpan[];
}
export interface DocImageBlock {
  _type: 'image';
  _key: string;
  asset?: { _type: 'reference'; _ref: string };
  alt?: string;
  caption?: string;
}
export interface DocTableRow {
  _type?: 'tableRow';
  _key: string;
  cells: string[];
}
export interface DocTableBlock {
  _type: 'table';
  _key: string;
  /** First row is shown as the header */
  headerRow?: boolean;
  rows: DocTableRow[];
}
export interface DocContactPerson {
  _type?: 'contactPerson';
  _key: string;
  name: string;
  role?: string;
  phone?: string;
  email?: string;
  photo?: { _type: 'image'; asset: { _type: 'reference'; _ref: string } };
}
/** "Who to call" cards: photo, name, role and contact details */
export interface DocContactsBlock {
  _type: 'contacts';
  _key: string;
  people: DocContactPerson[];
}
export type DocBlock = DocTextBlock | DocImageBlock | DocTableBlock | DocContactsBlock;

export const isTextBlock = (block: { _type: string }): block is DocTextBlock => block._type === 'block';

export const blockText = (block: { _type: string; children?: { text?: string }[] }) =>
  (block.children || []).map((child) => child.text || '').join('');

export const isHeading = (block: { _type: string; style?: string; listItem?: string }) =>
  block._type === 'block' && !block.listItem && (block.style === 'h2' || block.style === 'h3');

/** Anchor id for a heading — from its key, so it survives edits to the wording */
export const headingAnchor = (key: string) => `s-${key}`;

/**
 * Hand-typed numbers at the start of a heading: "1. ", "20.Inclement", "2.3 ",
 * "4) ". A plain number and space is left alone ("48 Hour Opt Out").
 */
export const TYPED_HEADING_NUMBER = /^\s*(?:\d+(?:\.\d+)+[.)]?|\d+[.)])\s*(?=\S)/;

export interface OutlineEntry {
  key: string;
  anchor: string;
  text: string;
  /** "1", "1.2" — empty when numbering is off */
  number: string;
  level: 2 | 3;
  children: OutlineEntry[];
}

/**
 * Sections with their subsections, numbered when asked. Used by the contents
 * list and to label headings, so they always agree.
 */
export function buildOutline(body: { _type: string; _key?: string; style?: string; listItem?: string; children?: { text?: string }[] }[], numbered: boolean): {
  sections: OutlineEntry[];
  numbers: Map<string, string>;
} {
  const sections: OutlineEntry[] = [];
  const numbers = new Map<string, string>();
  let sectionNo = 0;
  let subNo = 0;
  let current: OutlineEntry | null = null;

  for (const block of body || []) {
    if (!isHeading(block) || !block._key) continue;
    const text = blockText(block).trim();
    if (!text) continue;
    if (block.style === 'h2') {
      sectionNo += 1;
      subNo = 0;
      const number = numbered ? String(sectionNo) : '';
      current = { key: block._key, anchor: headingAnchor(block._key), text, number, level: 2, children: [] };
      sections.push(current);
      numbers.set(block._key, number);
    } else {
      subNo += 1;
      const number = numbered ? (sectionNo ? `${sectionNo}.${subNo}` : String(subNo)) : '';
      const entry: OutlineEntry = { key: block._key, anchor: headingAnchor(block._key), text, number, level: 3, children: [] };
      if (current) current.children.push(entry);
      else sections.push(entry);
      numbers.set(block._key, number);
    }
  }
  return { sections, numbers };
}

/** Short random key for new blocks, spans and rows */
export function newKey(): string {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
}
