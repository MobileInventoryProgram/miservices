/**
 * Bring member documents up to the document standard (lib/documents/standard.ts).
 *
 *   npx tsx --env-file=.env scripts/standardise-member-documents.ts            # dry run: report only
 *   npx tsx --env-file=.env scripts/standardise-member-documents.ts --write --backup <dir>
 *
 * Rules: heading levels by rank (top → Section, the rest → Subsection); fake
 * headings (contact lines, links, long text) become paragraphs; bold-only
 * lines introducing content become Subsections; ALL CAPS headings become Title
 * Case; typed heading numbers are removed (numbering switched on instead);
 * "Who to call" photo + name lines become contact cards; PDF page footers,
 * empty blocks, odd marks and deep lists are tidied. Flattened tables and
 * split sentences are fixed by hand-checked rules in scripts/data/document-fixes.ts.
 * Safe to re-run: a standard document comes out unchanged.
 */
import fs from 'fs';
import path from 'path';
import { createClient } from '@sanity/client';
import { DOCUMENT_FIXES, type DocumentFix } from './data/document-fixes';
import {
  MAX_LIST_LEVEL,
  TYPED_HEADING_NUMBER,
  blockText,
  newKey,
  type DocBlock,
  type DocContactPerson,
  type DocTextBlock,
} from '../lib/documents/standard';

const WRITE = process.argv.includes('--write');
const backupArg = process.argv.indexOf('--backup');
const BACKUP_DIR = backupArg > -1 ? process.argv[backupArg + 1] : '';
const ONLY = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : '';

const client = createClient({
  projectId: 'a4q9j3x1',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const HEADING = /^h[1-6]$/;
const ACRONYMS = new Set(['GDPR', 'AIP', 'CO', 'PAT', 'HMO', 'UK', 'HR', 'PPE', 'DBS', 'ID', 'SMS', 'VAT', 'ADR', 'TDS', 'CCTV', 'EPC', 'MOT', 'IT', 'EDI', 'OK', 'PDF', 'LED', 'TV', 'CRM', 'SEO', 'FAQ', 'FAQS', 'N/A']);
const SMALL = new Set(['a', 'an', 'and', 'as', 'at', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with', 'etc']);
const PHONE = /\b0\d{3}\s?\d{3}\s?\d{3,4}\b|\b07\d{3}\s?\d{6}\b/;

/** JSON with sorted keys, so stored and rebuilt documents compare fairly */
const canonical = (value: unknown): string =>
  JSON.stringify(value, (_k, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b))) : v));

const isAllCaps = (text: string) => /[A-Z]{2}/.test(text) && text === text.toUpperCase();

function titleCase(text: string): string {
  let first = true;
  return text
    .toLowerCase()
    .split(/(\s+|\/|-)/)
    .map((word) => {
      if (!word.trim() || word === '/' || word === '-') return word;
      const bare = word.replace(/[^a-z/]/gi, '').toUpperCase();
      let out: string;
      if (ACRONYMS.has(bare)) out = word.toUpperCase();
      else if (!first && SMALL.has(word.replace(/[^a-z]/g, ''))) out = word;
      else out = word.replace(/[a-z]/, (c) => c.toUpperCase());
      first = false;
      return out;
    })
    .join('')
    .replace(/\bMiservices\b/g, 'miServices')
    .replace(/\bMiprogram\b/g, 'miProgram');
}

const isBoldOnly = (block: DocTextBlock) =>
  block.children.some((c) => c.text.trim()) && block.children.every((c) => !c.text.trim() || (c.marks || []).includes('strong'));

function setText(block: DocTextBlock, text: string, keepMarks = false) {
  block.children = [{ _type: 'span', _key: block.children[0]?._key || newKey(), text, marks: keepMarks ? block.children[0]?.marks || [] : [] }];
  block.markDefs = [];
}

interface Report {
  lines: string[];
  counts: Record<string, number>;
}
const note = (r: Report, kind: string, detail?: string) => {
  r.counts[kind] = (r.counts[kind] || 0) + 1;
  if (detail) r.lines.push(`  ${kind}: ${detail.slice(0, 110)}`);
};

const FOOTER = /^(Pre Contract Disclosure Document|miService Processes Documentation|Mobile Inventory Training|Page \d+)$/i;
const NAME_START = /^((?:(?:Mc)?[A-Z]{2,}\b\s*){2,3})(.*)$/;

const matches = (block: Any, pattern: string) => {
  if (block._type !== 'block') return false;
  const text = blockText(block).trim();
  return text === pattern || (pattern.length >= 8 && text.startsWith(pattern));
};

const nameCase = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/\b([a-z])/g, (c) => c.toUpperCase())
    .replace(/\bMc([a-z])/g, (_, c) => `Mc${c.toUpperCase()}`);

/** The hand-checked fixes for this document (tables, split sentences, captions) */
function applyFixes(body: Any[], fix: DocumentFix, report: Report): Any[] {
  for (const r of fix.replace || []) {
    const start = body.findIndex((b) => matches(b, r.from));
    if (start < 0) {
      note(report, 'FIX NOT FOUND', r.from);
      continue;
    }
    let end = start + (r.count || 1) - 1;
    if (r.to) {
      end = body.findIndex((b, i) => i >= start && matches(b, r.to!));
      if (end < 0) {
        note(report, 'FIX END NOT FOUND', r.to);
        continue;
      }
    }
    const removed = body.slice(start, end + 1);
    const added = typeof r.with === 'function' ? r.with(removed) : r.with;
    body.splice(start, removed.length, ...added);
    note(report, 'fixed', `${removed.length} blocks from "${r.from}" → ${added.map((b: Any) => b._type).join(', ') || 'removed'}`);
  }
  for (const pattern of fix.joinPrevious || []) {
    const i = body.findIndex((b) => matches(b, pattern));
    const prev = body[i - 1];
    if (i < 1 || prev?._type !== 'block') {
      note(report, 'FIX NOT FOUND', pattern);
      continue;
    }
    const tail = blockText(body[i]).replace(/ — /g, ' ');
    prev.children[prev.children.length - 1].text += ` ${tail}`;
    body.splice(i, 1);
    note(report, 'rejoined split sentence', tail);
  }
  for (const pattern of fix.removeDashGaps || []) {
    const block = body.find((b) => matches(b, pattern));
    if (!block) note(report, 'FIX NOT FOUND', pattern);
    else block.children.forEach((c: Any) => (c.text = c.text.replace(/ — /g, ' ')));
  }
  for (const [pattern, caption] of Object.entries(fix.captionPreviousImage || {})) {
    const i = body.findIndex((b) => matches(b, pattern));
    if (i < 1 || body[i - 1]._type !== 'image') {
      note(report, 'FIX NOT FOUND', pattern);
      continue;
    }
    body[i - 1].caption = caption;
    body.splice(i, 1);
    note(report, 'label → photo caption', caption);
  }
  return body;
}

/** "Who to call": photos next to "NAME Role 0345 …" lines → contact cards */
function contactCards(body: Any[], report: Report): Any[] {
  const isContactText = (b: Any) => b._type === 'block' && !b.listItem && (PHONE.test(blockText(b)) || NAME_START.test(blockText(b).trim()));
  const out: Any[] = [];
  for (let i = 0; i < body.length; i++) {
    let j = i;
    while (j < body.length && (isContactText(body[j]) || (body[j]._type === 'image' && body[j + 1] && isContactText(body[j + 1])) || (body[j]._type === 'image' && j > i && isContactText(body[j - 1])))) j++;
    const run = body.slice(i, j);
    if (run.length < 2 || !run.some((b) => b._type === 'block' && PHONE.test(blockText(b)))) {
      out.push(body[i]);
      continue;
    }
    // One person per phone number, with the photo and text around it
    const people: DocContactPerson[] = [];
    let texts: string[] = [];
    let photo: Any = null;
    for (const b of run) {
      if (b._type === 'image') photo = photo || b;
      else texts.push(blockText(b).trim());
      const joined = texts.join(' ');
      const phone = joined.match(PHONE)?.[0];
      if (phone) {
        const rest = joined.replace(phone, '').trim();
        const m = rest.match(NAME_START);
        people.push({
          _type: 'contactPerson',
          _key: newKey(),
          name: nameCase(m ? m[1] : rest),
          ...(m && m[2].trim() ? { role: m[2].trim() } : {}),
          phone,
          ...(photo?.asset ? { photo: { _type: 'image', asset: photo.asset } } : {}),
        });
        texts = [];
        photo = null;
      }
    }
    out.push({ _type: 'contacts', _key: newKey(), people });
    note(report, `contact cards (${people.length})`, people.map((p) => `${p.name} | ${p.role || ''} | ${p.phone}${p.photo ? ' | photo' : ''}`).join(' ; '));
    i = j - 1;
  }
  return out;
}

export function standardise(slug: string, title: string, input: Any[], report: Report): { body: DocBlock[]; numbered: boolean } {
  let body: Any[] = JSON.parse(JSON.stringify(input || []));
  const fix = DOCUMENT_FIXES[slug] || {};

  // ─── Tidy text blocks ───────────────────────────────────────
  body = body.filter((block) => {
    if (block._type !== 'block') return true;
    const linkKeys = new Set((block.markDefs || []).filter((d: Any) => d._type === 'link' && d.href).map((d: Any) => d._key));
    block.markDefs = (block.markDefs || []).filter((d: Any) => linkKeys.has(d._key));
    block.children = (block.children || [])
      .filter((c: Any) => c._type === 'span')
      .map((c: Any) => ({
        _type: 'span',
        _key: c._key || newKey(),
        text: String(c.text || '').replace(/[ \t ]+/g, ' '),
        marks: (c.marks || []).filter((m: string) => m === 'strong' || m === 'em' || linkKeys.has(m)),
      }));
    if (block.children.length) {
      block.children[0].text = block.children[0].text.replace(/^\s+/, '');
      const last = block.children[block.children.length - 1];
      last.text = last.text.replace(/\s+$/, '');
    }
    const text = blockText(block).trim();
    if (!text) {
      note(report, 'removed empty block');
      return false;
    }
    if (FOOTER.test(text)) {
      note(report, 'removed PDF page footer', text);
      return false;
    }
    block._orig = text;
    if (block.listItem) {
      if (block.listItem !== 'bullet' && block.listItem !== 'number') block.listItem = 'bullet';
      if ((block.level || 1) > MAX_LIST_LEVEL) {
        note(report, 'list flattened to 2 levels', text);
        block.level = MAX_LIST_LEVEL;
      }
      block.style = 'normal';
    } else if (!HEADING.test(block.style || '') && block.style !== 'normal') {
      note(report, `style ${block.style} → paragraph`, text);
      block.style = 'normal';
    }
    return true;
  });

  body = applyFixes(body, fix, report);
  body = contactCards(body, report);

  // ─── Things styled as headings that aren't ──────────────────
  let firstHeading = true;
  body = body.filter((block) => {
    if (block._type !== 'block' || block.listItem || !HEADING.test(block.style || '')) return true;
    const text = blockText(block).trim();
    const bare = text.replace(TYPED_HEADING_NUMBER, '').trim().toLowerCase();
    const wasFirst = firstHeading;
    firstHeading = false;
    if (wasFirst && bare === title.trim().toLowerCase()) {
      note(report, 'removed heading repeating the title', text);
      return false;
    }
    if (bare === 'miservices') {
      note(report, 'removed stray heading', text);
      return false;
    }
    if (PHONE.test(text) || /^(https?:\/\/|www\.)/i.test(text) || text.length > 90) {
      note(report, 'heading → paragraph', text);
      block.style = 'normal';
    }
    return true;
  });

  // ─── Heading levels by rank ─────────────────────────────────
  const levels = Array.from(new Set(body.filter((b) => b._type === 'block' && !b.listItem && HEADING.test(b.style || '')).map((b) => Number(b.style[1])))).sort();
  for (const block of body) {
    if (block._type !== 'block' || block.listItem || !HEADING.test(block.style || '')) continue;
    const next = levels.indexOf(Number(block.style[1])) === 0 ? 'h2' : 'h3';
    if (next !== block.style) note(report, `${block.style} → ${next === 'h2' ? 'Section' : 'Subsection'}`);
    block.style = next;
  }

  // ─── Bold text: short lead-in lines → Subsection; whole bold paragraphs → plain
  for (let i = 0; i < body.length; i++) {
    const block = body[i];
    if (block._type !== 'block' || block.listItem || block.style !== 'normal' || !isBoldOnly(block)) continue;
    const text = blockText(block).trim();
    const next = body[i + 1];
    const leadIn = text.length <= 80 && !/[.:;,?!]$/.test(text) && !text.includes(' — ') && next && !(next._type === 'block' && !next.listItem && next.style !== 'normal');
    if (leadIn) {
      note(report, 'bold line → Subsection', text);
      block.style = 'h3';
    } else if (fix.unboldParagraphs) {
      // Only where the import made whole paragraphs bold; elsewhere bold is deliberate emphasis
      note(report, 'whole-bold paragraph → plain', text);
      block.children.forEach((c: Any) => (c.marks = (c.marks || []).filter((m: string) => m !== 'strong')));
    }
  }

  // ─── Final say from the hand-checked fixes ──────────────────
  body = body.filter((block) => {
    const override = block._type === 'block' ? fix.style?.[block._orig] : undefined;
    if (!override) return true;
    if (override === 'remove') {
      note(report, 'removed (fix)', block._orig);
      return false;
    }
    block.style = override;
    delete block.listItem;
    delete block.level;
    note(report, `style → ${override} (fix)`, block._orig);
    return true;
  });

  // ─── Heading text: no marks, no typed numbers, no ALL CAPS ──
  let typedNumbers = 0;
  let headings = 0;
  for (const block of body) {
    if (block._type !== 'block' || block.listItem || (block.style !== 'h2' && block.style !== 'h3')) continue;
    headings++;
    let text = blockText(block).trim();
    if (TYPED_HEADING_NUMBER.test(text)) {
      typedNumbers++;
      text = text.replace(TYPED_HEADING_NUMBER, '');
    }
    if (isAllCaps(text)) {
      const cased = titleCase(text);
      note(report, 'CAPS → Title Case', `${text} → ${cased}`);
      text = cased;
    }
    text = text.replace(/[:\s]+$/, '');
    if (text !== blockText(block) || block.children.length > 1 || block.children[0].marks?.length) setText(block, text);
  }
  if (typedNumbers) note(report, `typed heading numbers removed: ${typedNumbers}`);
  const numbered = fix.numberHeadings ?? (headings > 0 && typedNumbers >= Math.max(2, headings / 3));

  // Anything still looking like a flattened table is for a person to check
  for (const block of body) {
    if (block._type === 'block' && blockText(block).includes(' — ')) note(report, 'CHECK: " — " left in text', blockText(block));
    delete block._orig;
  }

  return { body, numbered };
}

(async () => {
  const docs: Any[] = await client.fetch(
    `*[_type == "memberDocument" && !(_id in path("drafts.**"))${ONLY ? ' && slug.current == $only' : ''}] | order(subcategory asc, order asc) { _id, _rev, title, "slug": slug.current, body, numberHeadings }`,
    { only: ONLY }
  );
  if (WRITE && !BACKUP_DIR) throw new Error('--write needs --backup <dir>');
  if (BACKUP_DIR) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    fs.writeFileSync(path.join(BACKUP_DIR, `member-documents-${Date.now()}.json`), JSON.stringify(docs, null, 1));
  }

  for (const doc of docs) {
    const report: Report = { lines: [], counts: {} };
    const { body, numbered } = standardise(doc.slug, doc.title, doc.body || [], report);
    const changed = canonical(body) !== canonical(doc.body || []) || !!doc.numberHeadings !== numbered;
    console.log(`\n## ${doc.title}  (${doc.slug})${changed ? '' : '  — already standard'}`);
    console.log(`  numbering: ${numbered ? 'ON' : 'off'} | ${Object.entries(report.counts).map(([k, v]) => `${k} ×${v}`).join(', ') || 'no changes'}`);
    if (process.argv.includes('--verbose')) report.lines.forEach((l) => console.log(l));
    if (changed && process.argv.includes('--diff')) {
      const a = canonical(doc.body || []);
      const b = canonical(body);
      let i = 0;
      while (a[i] === b[i] && i < a.length) i++;
      console.log(`  first difference:\n    was: ${a.slice(Math.max(0, i - 60), i + 60)}\n    now: ${b.slice(Math.max(0, i - 60), i + 60)}`);
    }
    if (WRITE && changed) {
      await client.patch(doc._id).ifRevisionId(doc._rev).set({ body, numberHeadings: numbered }).commit();
      console.log('  ✓ written');
    }
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
