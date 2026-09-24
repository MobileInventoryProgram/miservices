import { buildFlyerData, DEFAULT_FLYER_SETTINGS, type FlyerData } from '@/lib/flyer/data';
import { fillPlaceholders, textToBlocks, type QuoteTemplate, type TextBlock } from '@/lib/quote/template';
import { formatQuoteDate, quoteClientName, type Quote } from '@/lib/quote/types';
import type { SanityPriceList } from '@/lib/sanity';
import { quotePlaceholderValues, resolveQuoteSections } from '@/lib/quote/quotes';
import { buildMiProgramTable, type MiProgramTable } from '@/lib/quote/miprogram';
import type { MiProgramSettings } from '@/lib/quote/template';

/**
 * Everything needed to render a quote, shared by the HTML view
 * (components/quote/QuoteDocument.tsx) and the PDF (lib/quote/pdf.tsx).
 */

export interface QuoteDocumentSection {
  key: string;
  title: string;
  blocks: TextBlock[];
  /** Present on the pricing section */
  pricing?: FlyerData | null;
  /** Present on the miProgram section */
  miProgram?: MiProgramTable;
}

export interface QuoteDocumentData {
  reference: string;
  cover: { headline: string; intro: string };
  date: string;
  validUntil: string;
  client: { name: string; company?: string; lines: string[] };
  preparedBy: { name: string; franchiseName: string; lines: string[] };
  sections: QuoteDocumentSection[];
  priceListTitle?: string;
}

export function buildQuoteDocument(quote: Quote, template: QuoteTemplate, priceList: SanityPriceList | null): QuoteDocumentData {
  const values = quotePlaceholderValues(quote, template);
  // Sent quotes keep the cover and miProgram prices they were sent with
  const frozen = parseSnapshot(quote.templateSnapshot);
  const cover = frozen?.cover || {
    headline: fillPlaceholders(template.cover.headline, values),
    intro: fillPlaceholders(template.cover.intro, values),
  };
  const miProgramSettings = frozen?.miProgram || template.miProgram;
  const pricing = priceList ? buildFlyerData(priceList, DEFAULT_FLYER_SETTINGS) : null;
  const contact = quote.contact;
  const owner = quote.franchise.owners?.[0];

  const clientName = quoteClientName(quote);
  const clientLines = [
    contact?.companyName && contact.companyName !== clientName ? contact.companyName : '',
    ...(contact?.address ? contact.address.split('\n') : []),
    contact?.postcode || '',
    contact?.email || '',
    contact?.phone || '',
  ].filter(Boolean);

  const preparedLines = [values.franchiseName || '', quote.ownerEmail || owner?.email || '', owner?.phone || ''].filter(
    Boolean
  ) as string[];

  return {
    reference: quote.reference || 'Draft',
    cover,
    date: formatQuoteDate(quote.sentAt || new Date().toISOString()),
    validUntil: formatQuoteDate(quote.validUntil),
    client: { name: clientName, company: contact?.companyName, lines: clientLines },
    preparedBy: {
      name: values.senderName || values.franchiseName || 'miServices',
      franchiseName: values.franchiseName || 'miServices',
      lines: preparedLines,
    },
    priceListTitle: priceList?.title,
    sections: resolveQuoteSections(quote, template)
      .filter((section) => section.mode !== 'pricing' || pricing)
      .map((section) => ({
        key: section.key,
        title: section.title,
        blocks: textToBlocks(fillPlaceholders(section.text, values)),
        ...(section.mode === 'pricing' ? { pricing } : {}),
        ...(section.mode === 'miprogram' ? { miProgram: buildMiProgramTable(miProgramSettings, quote.propertyCount) } : {}),
      })),
  };
}

/** What a sent quote freezes from the template besides its sections */
export interface QuoteTemplateSnapshot {
  cover: { headline: string; intro: string };
  miProgram: MiProgramSettings;
}

function parseSnapshot(json?: string): QuoteTemplateSnapshot | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as QuoteTemplateSnapshot;
  } catch {
    return null;
  }
}
