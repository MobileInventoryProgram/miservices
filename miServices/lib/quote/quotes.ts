import { sanityWriteClient, type SanityPriceList } from '@/lib/sanity';
import { scopeFilter, type MemberScope } from '@/lib/members-access';
import { jobTypePlural } from '@/lib/job-types';
import {
  DEFAULT_QUOTE_TEMPLATE,
  type QuotePlaceholderValues,
  type QuoteTemplate,
  type QuoteTemplateSection,
} from '@/lib/quote/template';
import { formatQuoteDate, quoteClientName, type Quote, type QuoteSection } from '@/lib/quote/types';

/**
 * Quote reads and helpers. Reads use the uncached client so status changes
 * show immediately.
 */

const quoteFields = `
  _id, reference, status, propertyCount, jobTypes,
  sections[] { _key, key, title, mode, text },
  emailSubject, emailMessage, validUntil, shareToken, sentTo, priceSnapshot, templateSnapshot,
  "createdAt": coalesce(createdAt, _createdAt),
  "updatedAt": coalesce(updatedAt, _updatedAt),
  sentAt, viewedAt, respondedAt, respondedByName, declineReason,
  "priceListId": priceList._ref,
  "priceListTitle": priceList->title,
  "contact": contact->{ _id, firstName, lastName, companyName, email, phone, address, postcode },
  "franchise": franchise->{
    _id, companyName, territory, "slug": slug.current,
    owners[] { firstName, lastName, email, phone }
  },
  "ownerId": owner._ref,
  "ownerName": owner->name,
  "ownerEmail": owner->email
`;

// ─── Template ───────────────────────────────────────────────────

type StoredTemplate = Partial<Omit<QuoteTemplate, 'cover' | 'booking' | 'miProgram'>> & {
  cover?: Partial<QuoteTemplate['cover']>;
  booking?: Partial<QuoteTemplate['booking']>;
  miProgram?: Partial<QuoteTemplate['miProgram']>;
};

/** Stored (Studio / admin editor) template laid over the defaults, field by field */
export function mergeQuoteTemplate(doc: StoredTemplate | null): QuoteTemplate {
  const d = DEFAULT_QUOTE_TEMPLATE;
  if (!doc) return d;
  const pick = <T,>(value: T | null | undefined, fallback: T): T =>
    value === undefined || value === null || value === '' ? fallback : value;
  return {
    cover: { headline: pick(doc.cover?.headline, d.cover.headline), intro: pick(doc.cover?.intro, d.cover.intro) },
    booking: {
      phone: pick(doc.booking?.phone, d.booking.phone),
      email: pick(doc.booking?.email, d.booking.email),
      url: pick(doc.booking?.url, d.booking.url),
    },
    miProgram: {
      discountPercent: pick(doc.miProgram?.discountPercent, d.miProgram.discountPercent),
      tiers: doc.miProgram?.tiers?.length ? doc.miProgram.tiers : d.miProgram.tiers,
      note: pick(doc.miProgram?.note, d.miProgram.note),
      url: pick(doc.miProgram?.url, d.miProgram.url),
    },
    sections: doc.sections?.length ? (doc.sections as QuoteTemplateSection[]) : d.sections,
    validityDays: doc.validityDays || d.validityDays,
    emailSubject: pick(doc.emailSubject, d.emailSubject),
    emailMessage: pick(doc.emailMessage, d.emailMessage),
  };
}

export async function getQuoteTemplate(): Promise<QuoteTemplate> {
  try {
    // Uncached so an admin's template changes apply to the next quote straight away
    const doc = await sanityWriteClient.fetch<StoredTemplate | null>(
      `*[_type == "quoteTemplate" && _id == "quoteTemplate"][0] {
        cover { headline, intro }, booking { phone, email, url },
        miProgram { discountPercent, tiers[] { upTo, monthly, annual }, note, url },
        sections[] { key, title, mode, text, hint }, validityDays, emailSubject, emailMessage
      }`
    );
    return mergeQuoteTemplate(doc);
  } catch (error) {
    console.error('Error fetching quote template:', error);
    return DEFAULT_QUOTE_TEMPLATE;
  }
}

/**
 * Sections to show for a quote. Drafts follow the current template (locked
 * and pricing sections always use Head Office wording; editable ones keep the
 * franchisee's text). Sent quotes are frozen as they were sent.
 */
export function resolveQuoteSections(quote: Pick<Quote, 'status' | 'sections'>, template: QuoteTemplate): QuoteSection[] {
  if (quote.status !== 'draft' && quote.sections?.length) return quote.sections;

  const saved = new Map((quote.sections || []).map((section) => [section.key, section]));
  return template.sections.map((section) => ({
    key: section.key,
    title: section.title,
    mode: section.mode,
    text: section.mode === 'editable' ? saved.get(section.key)?.text ?? section.text : section.text,
  }));
}

// ─── Reads ──────────────────────────────────────────────────────

export async function getQuotesForScope(scope: MemberScope, contactId?: string): Promise<Quote[]> {
  try {
    return await sanityWriteClient.fetch<Quote[]>(
      `*[_type == "quote"${scopeFilter(scope)}${contactId ? ' && contact._ref == $contactId' : ''}]
        | order(coalesce(createdAt, _createdAt) desc) { ${quoteFields} }`,
      { franchiseeId: scope.franchiseeId, contactId: contactId || null }
    );
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return [];
  }
}

export async function getQuoteForScope(scope: MemberScope, quoteId: string): Promise<Quote | null> {
  try {
    return await sanityWriteClient.fetch<Quote | null>(
      `*[_type == "quote" && _id == $quoteId${scopeFilter(scope)}][0] { ${quoteFields} }`,
      { quoteId, franchiseeId: scope.franchiseeId }
    );
  } catch (error) {
    console.error('Error fetching quote:', error);
    return null;
  }
}

/** Sent quote behind a client link (drafts are never public) */
export async function getQuoteByToken(token: string): Promise<Quote | null> {
  try {
    return await sanityWriteClient.fetch<Quote | null>(
      `*[_type == "quote" && shareToken == $shareToken && status != "draft"][0] { ${quoteFields} }`,
      { shareToken: token }
    );
  } catch (error) {
    console.error('Error fetching quote by token:', error);
    return null;
  }
}

/** Price list for a quote: the frozen snapshot once sent, the live list while a draft */
export async function getQuotePriceList(quote: Pick<Quote, 'status' | 'priceSnapshot' | 'priceListId'>): Promise<SanityPriceList | null> {
  if (quote.status !== 'draft' && quote.priceSnapshot) {
    try {
      return JSON.parse(quote.priceSnapshot) as SanityPriceList;
    } catch {
      return null;
    }
  }
  if (!quote.priceListId) return null;
  return sanityWriteClient.fetch<SanityPriceList | null>(
    `*[_type == "priceList" && _id == $id][0] {
      _id, title, isDefault, serviceRows[] { _key, serviceType, bedrooms, maxRooms, unfurnishedPrice, furnishedPrice },
      flatRates[] { _key, name, price, unit }, additionalRoomRates { unfurnishedPerRoom, furnishedPerRoom },
      cancellationFee, flyerNote
    }`,
    { id: quote.priceListId }
  );
}

// ─── Helpers ────────────────────────────────────────────────────

/** Next reference for a franchise, e.g. Q-HERTS-0012 */
export async function nextQuoteReference(franchiseeId: string): Promise<string> {
  const info = await sanityWriteClient.fetch<{ slug?: string; territory?: string; count: number }>(
    `{
      "slug": *[_id == $franchiseeId][0].slug.current,
      "territory": *[_id == $franchiseeId][0].territory,
      "count": count(*[_type == "quote" && franchise._ref == $franchiseeId])
    }`,
    { franchiseeId }
  );
  const code = (info.slug || info.territory || 'MIS').toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `Q-${code}-${String(info.count + 1).padStart(4, '0')}`;
}

function joinWords(words: string[]): string {
  if (words.length <= 1) return words.join('');
  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
}

/** Values for {placeholders} in template text */
export function quotePlaceholderValues(
  quote: Pick<Quote, 'contact' | 'franchise' | 'propertyCount' | 'jobTypes' | 'validUntil' | 'ownerName' | 'ownerEmail'>,
  template: QuoteTemplate = DEFAULT_QUOTE_TEMPLATE
): QuotePlaceholderValues {
  const contact = quote.contact;
  const owners = (quote.franchise.owners || [])
    .map((owner) => [owner.firstName, owner.lastName].filter(Boolean).join(' '))
    .filter(Boolean);
  const territory = quote.franchise.territory || quote.franchise.companyName || '';

  return {
    clientFirstName: contact?.firstName || contact?.companyName || '',
    clientName: contact ? quoteClientName({ contact }) : '',
    companyName: contact?.companyName || (contact ? quoteClientName({ contact }) : ''),
    propertyCount: quote.propertyCount != null ? String(quote.propertyCount) : '',
    jobTypes: quote.jobTypes?.length
      ? joinWords(quote.jobTypes.map(jobTypePlural))
      : '',
    franchiseName: territory ? `miServices ${territory}` : 'miServices',
    territory,
    senderName: quote.ownerName || owners[0] || '',
    ownerNames: joinWords(owners),
    validUntil: quote.validUntil ? formatQuoteDate(quote.validUntil) : '',
    franchisePhone: quote.franchise.owners?.find((o) => o.phone)?.phone || template.booking.phone,
    franchiseEmail: quote.ownerEmail || quote.franchise.owners?.find((o) => o.email)?.email || template.booking.email,
    bookingPhone: template.booking.phone,
    bookingEmail: template.booking.email,
    bookingUrl: template.booking.url,
    miProgramDiscount: `${template.miProgram.discountPercent}%`,
  };
}

// ─── Paged list ─────────────────────────────────────────────────

export interface QuoteFilters {
  q?: string;
  status?: string;
  franchise?: string;
  contact?: string;
  page: number;
  pageSize: number;
}

/** Search/filter quotes in the database and return one page plus the total */
export async function getQuotesPage(scope: MemberScope, filters: QuoteFilters): Promise<{ items: Quote[]; total: number }> {
  let filter = `_type == "quote"${scopeFilter(scope)}`;
  const today = new Date().toISOString().slice(0, 10);
  const params: Record<string, unknown> = { franchiseeId: scope.franchiseeId, today };

  // "Expired" isn't stored: it's a sent/viewed quote past its valid-until date
  const expired = '(status in ["sent", "viewed"] && defined(validUntil) && validUntil < $today)';
  if (filters.status === 'expired') filter += ` && ${expired}`;
  else if (filters.status === 'sent' || filters.status === 'viewed') filter += ` && status == $status && !${expired}`;
  else if (filters.status) filter += ' && status == $status';
  if (filters.status) params.status = filters.status;

  if (filters.franchise && scope.isAdmin) {
    filter += ' && franchise._ref == $franchise';
    params.franchise = filters.franchise;
  }
  if (filters.contact) {
    filter += ' && contact._ref == $contact';
    params.contact = filters.contact;
  }
  const q = filters.q?.trim().replace(/[*"\\]/g, '');
  if (q) {
    filter += ' && [reference, contact->firstName, contact->lastName, contact->companyName, contact->email] match $q';
    params.q = q.split(/\s+/).map((word) => `${word}*`);
  }
  const start = (filters.page - 1) * filters.pageSize;
  params.start = start;
  params.end = start + filters.pageSize;

  try {
    return await sanityWriteClient.fetch<{ items: Quote[]; total: number }>(
      `{
        "items": *[${filter}] | order(coalesce(createdAt, _createdAt) desc) [$start...$end] { ${quoteFields} },
        "total": count(*[${filter}])
      }`,
      params
    );
  } catch (error) {
    console.error('Error fetching quotes page:', error);
    return { items: [], total: 0 };
  }
}

export async function countQuotesForScope(scope: MemberScope): Promise<number> {
  try {
    return await sanityWriteClient.fetch<number>(`count(*[_type == "quote"${scopeFilter(scope)}])`, { franchiseeId: scope.franchiseeId });
  } catch {
    return 0;
  }
}

/** Franchises that have quotes, for Head Office's franchise filter */
export async function getQuoteFranchiseOptions(): Promise<{ id: string; name: string }[]> {
  try {
    return await sanityWriteClient.fetch<{ id: string; name: string }[]>(
      `*[_type == "franchisee" && _id in *[_type == "quote"].franchise._ref] | order(companyName asc) { "id": _id, "name": companyName }`
    );
  } catch {
    return [];
  }
}
