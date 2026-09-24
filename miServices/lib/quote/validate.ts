import { JOB_TYPE_VALUES } from '@/lib/job-types';
import type { QuoteTemplate } from '@/lib/quote/template';

/** Editable quote fields from the builder */
export interface QuoteInput {
  contactId: string;
  priceListId: string;
  propertyCount: number | null;
  jobTypes: string[];
  /** Franchisee text for editable sections, by section key */
  sections: { key: string; text: string }[];
  validUntil: string;
  emailSubject: string;
  emailMessage: string;
}

const str = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

export function parseQuoteInput(body: unknown): { data?: QuoteInput; error?: string } {
  if (!body || typeof body !== 'object') return { error: 'Invalid request' };
  const input = body as Record<string, unknown>;

  const contactId = str(input.contactId, 100);
  if (!contactId) return { error: 'Please choose or add a client.' };

  const priceListId = str(input.priceListId, 100);
  if (!priceListId) return { error: 'Please choose a price list.' };

  let propertyCount: number | null = null;
  if (input.propertyCount !== undefined && input.propertyCount !== null && input.propertyCount !== '') {
    const count = Number(input.propertyCount);
    if (!Number.isInteger(count) || count < 0 || count > 100000) {
      return { error: 'Number of properties must be a whole number.' };
    }
    propertyCount = count;
  }

  const validUntil = str(input.validUntil, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(validUntil) || Number.isNaN(Date.parse(validUntil))) {
    return { error: 'Please choose a valid "valid until" date.' };
  }

  const sections = Array.isArray(input.sections)
    ? input.sections
        .filter((s): s is { key: string; text: string } => !!s && typeof s.key === 'string' && typeof s.text === 'string')
        .map((s) => ({ key: s.key.slice(0, 50), text: s.text.slice(0, 10000) }))
    : [];

  return {
    data: {
      contactId,
      priceListId,
      propertyCount,
      jobTypes: Array.isArray(input.jobTypes)
        ? Array.from(new Set(input.jobTypes.filter((j): j is string => typeof j === 'string' && JOB_TYPE_VALUES.includes(j))))
        : [],
      sections,
      validUntil,
      emailSubject: str(input.emailSubject, 200),
      emailMessage: typeof input.emailMessage === 'string' ? input.emailMessage.slice(0, 5000) : '',
    },
  };
}

/** Editable sections to store on a draft (locked/pricing always follow the template) */
export function draftSections(template: QuoteTemplate, input: QuoteInput) {
  const edits = new Map(input.sections.map((s) => [s.key, s.text]));
  return template.sections
    .filter((section) => section.mode === 'editable')
    .map((section) => ({
      _key: section.key,
      key: section.key,
      title: section.title,
      mode: section.mode,
      text: edits.get(section.key) ?? section.text,
    }));
}
