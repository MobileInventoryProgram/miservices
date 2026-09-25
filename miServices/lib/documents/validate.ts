import { DOC_DECORATORS, MAX_LIST_LEVEL, newKey, type DocBlock } from '@/lib/documents/standard';


export interface DocumentInput {
  title: string;
  description: string;
  subcategory: string;
  order: number;
  numberHeadings: boolean;
  isPublished: boolean;
  body: DocBlock[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

const str = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const key = (value: unknown) => (typeof value === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(value) ? value : newKey());
const DECORATORS = DOC_DECORATORS.map((d) => d.name) as string[];
const SAFE_HREF = /^(https?:\/\/|mailto:|tel:)/i;
const ASSET_REF = /^image-[A-Za-z0-9]+-\d+x\d+-[a-z]+$/;

const imageRef = (value: Any) =>
  typeof value?.asset?._ref === 'string' && ASSET_REF.test(value.asset._ref) ? { _type: 'reference' as const, _ref: value.asset._ref } : null;

/**
 * Bring a document body from the editor down to the standard: known block
 * types only, Section/Subsection/Paragraph, two list levels, bold/italic/links.
 * Anything else pasted in is converted rather than rejected.
 */
export function sanitiseBody(input: unknown): DocBlock[] {
  if (!Array.isArray(input)) return [];
  const out: DocBlock[] = [];
  for (const raw of input.slice(0, 5000) as Any[]) {
    if (raw?._type === 'block') {
      const markDefs = (Array.isArray(raw.markDefs) ? raw.markDefs : [])
        .filter((d: Any) => d?._type === 'link' && typeof d.href === 'string' && SAFE_HREF.test(d.href.trim()))
        .map((d: Any) => ({ _type: 'link', _key: key(d._key), href: d.href.trim().slice(0, 2000) }));
      const linkKeys = new Set(markDefs.map((d: Any) => d._key));
      const children = (Array.isArray(raw.children) ? raw.children : [])
        .filter((c: Any) => c?._type === 'span' && typeof c.text === 'string')
        .map((c: Any) => ({
          _type: 'span' as const,
          _key: key(c._key),
          text: c.text.slice(0, 20000),
          marks: (Array.isArray(c.marks) ? c.marks : []).filter((m: string) => DECORATORS.includes(m) || linkKeys.has(m)),
        }));
      if (children.length === 0) children.push({ _type: 'span', _key: newKey(), text: '', marks: [] });
      const isList = raw.listItem === 'bullet' || raw.listItem === 'number';
      const style = !isList && (raw.style === 'h2' || raw.style === 'h3') ? raw.style : 'normal';
      const heading = style !== 'normal';
      out.push({
        _type: 'block',
        _key: key(raw._key),
        style,
        ...(isList ? { listItem: raw.listItem, level: Math.min(MAX_LIST_LEVEL, Math.max(1, Number(raw.level) || 1)) } : {}),
        markDefs: heading ? [] : markDefs,
        // Headings take their weight from the style, never from marks
        children: heading ? [{ _type: 'span', _key: children[0]._key, text: children.map((c: Any) => c.text).join('').replace(/\s+/g, ' '), marks: [] }] : children,
      });
    } else if (raw?._type === 'image') {
      const asset = imageRef(raw);
      if (!asset) continue;
      out.push({ _type: 'image', _key: key(raw._key), asset, ...(str(raw.alt, 300) ? { alt: str(raw.alt, 300) } : {}), ...(str(raw.caption, 300) ? { caption: str(raw.caption, 300) } : {}) });
    } else if (raw?._type === 'table') {
      const rows = (Array.isArray(raw.rows) ? raw.rows : []).slice(0, 200).map((r: Any) => (Array.isArray(r?.cells) ? r.cells : []).slice(0, 12).map((c: unknown) => (typeof c === 'string' ? c.slice(0, 2000) : '')));
      const width = Math.max(1, ...rows.map((r: string[]) => r.length));
      if (rows.length === 0) continue;
      out.push({
        _type: 'table',
        _key: key(raw._key),
        headerRow: raw.headerRow !== false,
        rows: rows.map((cells: string[], i: number) => ({
          _type: 'tableRow',
          _key: key(raw.rows[i]?._key),
          cells: [...cells, ...Array(width - cells.length).fill('')],
        })),
      });
    } else if (raw?._type === 'contacts') {
      const people = (Array.isArray(raw.people) ? raw.people : [])
        .slice(0, 50)
        .filter((p: Any) => str(p?.name, 100))
        .map((p: Any) => {
          const photo = imageRef(p.photo);
          return {
            _type: 'contactPerson' as const,
            _key: key(p._key),
            name: str(p.name, 100),
            ...(str(p.role, 100) ? { role: str(p.role, 100) } : {}),
            ...(str(p.phone, 40) ? { phone: str(p.phone, 40) } : {}),
            ...(str(p.email, 200) ? { email: str(p.email, 200) } : {}),
            ...(photo ? { photo: { _type: 'image' as const, asset: photo } } : {}),
          };
        });
      if (people.length) out.push({ _type: 'contacts', _key: key(raw._key), people });
    }
  }
  // Keys must be unique within the document
  const seen = new Set<string>();
  for (const block of out) {
    if (seen.has(block._key)) block._key = newKey();
    seen.add(block._key);
  }
  return out;
}

/** `sections`: the section web addresses that exist (from the CMS) */
export function parseDocumentInput(body: unknown, sections: string[]): { data?: DocumentInput; error?: string } {
  if (!body || typeof body !== 'object') return { error: 'Invalid request' };
  const input = body as Record<string, unknown>;
  const title = str(input.title, 160);
  if (!title) return { error: 'Please give the document a title.' };
  const subcategory = String(input.subcategory || '');
  if (!sections.includes(subcategory)) return { error: 'Choose which section the document belongs in.' };
  const order = Number(input.order);
  return {
    data: {
      title,
      description: str(input.description, 500),
      subcategory,
      order: Number.isFinite(order) ? Math.max(0, Math.min(999, Math.round(order))) : 0,
      numberHeadings: input.numberHeadings === true,
      isPublished: input.isPublished !== false,
      body: sanitiseBody(input.body),
    },
  };
}

export function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'document'
  );
}
