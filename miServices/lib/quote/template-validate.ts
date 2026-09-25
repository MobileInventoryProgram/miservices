import { SECTION_MODES, type QuoteSectionMode, type QuoteTemplate } from '@/lib/quote/template';

const str = (value: unknown, max: number) => (typeof value === 'string' ? value.replace(/\r\n/g, '\n').trim().slice(0, max) : '');
const num = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : NaN);
const MODES = SECTION_MODES.map((m) => m.value) as string[];

/** A stable key from a section title, e.g. "Our Guarantee" → "ourGuarantee" */
export function sectionKeyFromTitle(title: string): string {
  const words = title.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  const key = words.map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))).join('').slice(0, 40);
  return key || 'section';
}

/**
 * Validate the quote template from the admin editor. Section keys stay as they
 * are (drafts match franchise wording to sections by key); new sections get a
 * unique key from their title.
 */
export function parseQuoteTemplateInput(body: unknown): { data?: QuoteTemplate; error?: string } {
  if (!body || typeof body !== 'object') return { error: 'Invalid request' };
  const input = body as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

  if (!Array.isArray(input.sections) || input.sections.length === 0) return { error: 'The quote needs at least one section.' };
  if (input.sections.length > 30) return { error: 'Too many sections.' };

  const used = new Set<string>();
  const sections: QuoteTemplate['sections'] = [];
  for (const raw of input.sections) {
    const title = str(raw?.title, 80);
    if (!title) return { error: 'Every section needs a title.' };
    const mode = String(raw?.mode || '');
    if (!MODES.includes(mode)) return { error: `${title}: choose what kind of section this is.` };
    let key = /^[A-Za-z][A-Za-z0-9_-]{0,39}$/.test(raw?.key || '') ? String(raw.key) : sectionKeyFromTitle(title);
    if (used.has(key)) {
      if (raw?.key === key) return { error: `Two sections share the key "${key}".` };
      let n = 2;
      while (used.has(`${key}${n}`)) n++;
      key = `${key}${n}`;
    }
    used.add(key);
    const hint = str(raw?.hint, 200);
    sections.push({ key, title, mode: mode as QuoteSectionMode, text: str(raw?.text, 8000), ...(hint ? { hint } : {}) });
  }
  if (sections.filter((s) => s.mode === 'pricing').length > 1) return { error: 'Only one section can show the price list.' };
  if (sections.filter((s) => s.mode === 'miprogram').length > 1) return { error: 'Only one section can show miProgram pricing.' };

  const cover = { headline: str(input.cover?.headline, 160), intro: str(input.cover?.intro, 300) };
  if (!cover.headline) return { error: 'Enter a cover headline.' };

  const booking = { phone: str(input.booking?.phone, 40), email: str(input.booking?.email, 120), url: str(input.booking?.url, 200) };

  const mp = input.miProgram || {};
  const discountPercent = num(mp.discountPercent);
  if (!(discountPercent >= 0 && discountPercent <= 100)) return { error: 'miProgram discount must be between 0% and 100%.' };
  if (!Array.isArray(mp.tiers) || mp.tiers.length === 0) return { error: 'Add at least one miProgram tier.' };
  const tiers = mp.tiers.map((t: Record<string, unknown>) => ({ upTo: num(t?.upTo), monthly: num(t?.monthly), annual: num(t?.annual) }));
  for (const t of tiers) {
    if (!(Number.isInteger(t.upTo) && t.upTo > 0)) return { error: 'Each miProgram tier needs a whole number of properties.' };
    if (!(t.monthly >= 0) || !(t.annual >= 0)) return { error: `miProgram tier up to ${t.upTo}: enter prices of £0 or more.` };
  }
  tiers.sort((a: { upTo: number }, b: { upTo: number }) => a.upTo - b.upTo);
  if (new Set(tiers.map((t: { upTo: number }) => t.upTo)).size !== tiers.length) return { error: 'Two miProgram tiers have the same property count.' };

  const validityDays = num(input.validityDays);
  if (!(Number.isInteger(validityDays) && validityDays >= 1 && validityDays <= 365)) return { error: 'Quote validity must be 1 to 365 days.' };

  return {
    data: {
      cover,
      booking,
      miProgram: { discountPercent, tiers, note: str(mp.note, 1000), url: str(mp.url, 200) },
      sections,
      validityDays,
      emailSubject: str(input.emailSubject, 200),
      emailMessage: str(input.emailMessage, 4000),
    },
  };
}
