/**
 * Head Office quote template: the sections every quote is built from.
 * Studio → Franchise Login → Quote Template overrides these defaults.
 * Client-safe (no Sanity client).
 *
 * Section text is plain text: blank lines separate paragraphs, lines starting
 * with "- " are bullet points, and {placeholders} are filled per quote.
 */

export type QuoteSectionMode = 'locked' | 'editable' | 'pricing' | 'miprogram';

export const SECTION_MODES: { value: QuoteSectionMode; label: string; description: string }[] = [
  { value: 'locked', label: 'Locked', description: 'Head Office wording only' },
  { value: 'editable', label: 'Franchise can edit', description: 'A starting point franchisees can rewrite' },
  { value: 'pricing', label: 'Pricing', description: "Text followed by the quote's price list table" },
  { value: 'miprogram', label: 'miProgram pricing', description: "Text followed by the miProgram tier table and the client's discounted price" },
];

export interface QuoteTemplateSection {
  key: string;
  title: string;
  mode: QuoteSectionMode;
  text: string;
  /** Short hint shown to the franchisee in the builder */
  hint?: string;
}

export interface MiProgramTier {
  /** Maximum number of properties for this tier */
  upTo: number;
  monthly: number;
  annual: number;
}

export interface MiProgramSettings {
  discountPercent: number;
  tiers: MiProgramTier[];
  /** Small print under the table */
  note: string;
  url: string;
}

export interface QuoteTemplate {
  cover: { headline: string; intro: string };
  booking: { phone: string; email: string; url: string };
  miProgram: MiProgramSettings;
  sections: QuoteTemplateSection[];
  /** Days a quote stays valid by default */
  validityDays: number;
  emailSubject: string;
  emailMessage: string;
}

export const QUOTE_PLACEHOLDERS: { key: string; description: string }[] = [
  { key: 'clientFirstName', description: "Client's first name" },
  { key: 'clientName', description: "Client's full name" },
  { key: 'companyName', description: "Client's company (or their name)" },
  { key: 'propertyCount', description: 'Number of properties' },
  { key: 'jobTypes', description: 'Job types, e.g. "inventories and check-outs"' },
  { key: 'franchiseName', description: 'Franchise name, e.g. "miServices Herts"' },
  { key: 'territory', description: 'Territory, e.g. "Herts"' },
  { key: 'senderName', description: 'Name of the person sending the quote' },
  { key: 'ownerNames', description: 'Franchise owner name(s)' },
  { key: 'validUntil', description: 'Date the quote is valid until' },
  { key: 'franchisePhone', description: "Franchise's phone number" },
  { key: 'franchiseEmail', description: "Franchise's email address" },
  { key: 'bookingPhone', description: 'Head Office booking phone' },
  { key: 'bookingEmail', description: 'Head Office booking email' },
  { key: 'bookingUrl', description: 'Online booking address' },
  { key: 'miProgramDiscount', description: 'miProgram discount, e.g. "50%"' },
];

export const DEFAULT_MIPROGRAM: MiProgramSettings = {
  discountPercent: 50,
  tiers: [
    { upTo: 10, monthly: 10, annual: 100 },
    { upTo: 25, monthly: 20, annual: 200 },
    { upTo: 50, monthly: 30, annual: 300 },
    { upTo: 100, monthly: 45, annual: 450 },
    { upTo: 250, monthly: 65, annual: 650 },
    { upTo: 500, monthly: 75, annual: 750 },
    { upTo: 750, monthly: 112.5, annual: 1125 },
    { upTo: 1000, monthly: 150, annual: 1500 },
  ],
  note: 'miProgram prices exclude VAT and are billed by miProgram. Annual billing gives two months free. Minimum term 12 months, then rolling monthly. Includes two users; extra users £5 per month.',
  url: 'www.miprogram.co.uk/pricing',
};

export const DEFAULT_QUOTE_TEMPLATE: QuoteTemplate = {
  cover: {
    headline: 'Proposal for {companyName}',
    intro: 'Property inventory and inspection services, prepared by {franchiseName}.',
  },
  booking: {
    phone: '0345 680 7976',
    email: 'booking@mobileinventory.co.uk',
    url: 'www.mobileinventoryservices.co.uk/booking',
  },
  miProgram: DEFAULT_MIPROGRAM,
  validityDays: 30,
  emailSubject: 'Your quote from {franchiseName}',
  emailMessage:
    'Hi {clientFirstName},\n\nThank you for your interest in miServices. Please find your quote for {companyName} below — you can view it online, download a PDF, and accept it with one click.\n\nIf you have any questions, just reply to this email.\n\nKind regards,\n{senderName}\n{franchiseName}',
  sections: [
    {
      key: 'introduction',
      title: 'Introduction',
      mode: 'editable',
      hint: 'A short personal note to the client about their requirements.',
      text: 'Dear {clientFirstName},\n\nThank you for the opportunity to quote for {companyName}. Following our conversation, we have put together this proposal for your {jobTypes}, covering {propertyCount} properties.\n\nBelow you will find an introduction to miServices, the services we provide, your local team, and our pricing.',
    },
    {
      key: 'about',
      title: 'About miServices',
      mode: 'locked',
      text: 'miServices is a specialist inventory provider to the lettings industry. Founded in 2009, we have grown into one of the UK\'s largest property reporting networks, with local franchise offices supported by a dedicated head office team.\n\nAll of our clerks are trained to the same professional standard by the AIP (Association of Inventory Professionals). Using our own inventory app, we produce clear, consistent reports quickly and effectively — signed digitally, with no third-party apps required.',
    },
    {
      key: 'services',
      title: 'Our Services',
      mode: 'locked',
      text: '- Inventory reports — comprehensive property inventories with detailed documentation and professional photography.\n- Check-in and check-out inspections — thorough inspections at the start and end of tenancies to protect landlords and agents.\n- Mid-term property visits — regular inspections to monitor condition and identify maintenance issues early.\n- Block management inspections — inspection services for multi-unit properties and apartment blocks.\n- Virtual tours and floor plans — marketing-ready virtual tours, floor plans and photography.',
    },
    {
      key: 'why',
      title: 'Why Choose miServices',
      mode: 'locked',
      text: '- Centralised booking — one point of contact for all reports, with no need to manage multiple clerks or diaries.\n- Standardised reporting — every report follows the same high standard, backed by our quality assurance processes.\n- Reports available next day, from professional clerks available Monday to Saturday.\n- Last-minute bookings accepted.\n- Consolidated invoicing — clear, simple monthly billing for multi-branch agencies and portfolios.\n- Dedicated customer support.',
    },
    {
      key: 'team',
      title: 'Your Local Team',
      mode: 'editable',
      hint: 'Introduce yourself and your team — experience, coverage and anything that sets you apart.',
      text: '{franchiseName} is run by {ownerNames}, providing the full miServices service across {territory}. As your local team, we will be your day-to-day point of contact for bookings, reports and any questions.',
    },
    {
      key: 'pricing',
      title: 'Your Pricing',
      mode: 'pricing',
      text: 'The prices below are based on the price list selected for this quote. All prices are exclusive of VAT.',
    },
    {
      key: 'booking',
      title: 'Making a Booking',
      mode: 'locked',
      text: 'Booking with miServices is quick and simple. You can book through our central booking team or directly with your local office — whichever suits you best.\n\n- Online: {bookingUrl}\n- Central booking line: {bookingPhone}\n- Central booking email: {bookingEmail}\n- Your local team, {franchiseName}: {franchisePhone} · {franchiseEmail}\n\nWhen you book, it helps to have the following to hand:\n\n- The property address and number of bedrooms\n- Whether the property is furnished or unfurnished\n- Access arrangements and where the keys will be collected from\n- Tenant names and contact details (for check-ins and check-outs)\n- Your preferred date and time\n\nLast-minute bookings are accepted wherever possible. Cancellations are charged in line with the cancellation fee shown in your pricing.',
    },
    {
      key: 'miprogram',
      title: 'miProgram Licence',
      mode: 'miprogram',
      text: 'miServices reports are produced using miProgram, specialist inventory software developed by a separate company, miProgram, which miServices is licensed to use.\n\nAs a miServices client you can choose to take your own miProgram licence to get more from your reports:\n\n- Digital reports with web-view sharing and PDF downloads\n- Digital signatures from tenants, landlords and agents\n- Unlimited reports and long-term secure storage\n- Your own web dashboard to view, share and manage every report\n- Carry out your own interim and mid-term inspections using the miProgram app\n\nWhen you use miServices for your inventories and check-outs, you receive {miProgramDiscount} off miProgram web dashboard access.',
    },
    {
      key: 'nextSteps',
      title: 'Next Steps',
      mode: 'editable',
      hint: 'Tell the client how to get started.',
      text: 'To go ahead, simply click "Accept quote" on the online version of this proposal, or reply to this email. We will then set up your account and you can start booking straight away.\n\nThis quote is valid until {validUntil}.',
    },
    {
      key: 'terms',
      title: 'Terms',
      mode: 'locked',
      text: 'All work is carried out under the miServices terms and conditions, available at www.mobileinventoryservices.co.uk/terms. Prices are exclusive of VAT at the prevailing rate. This proposal is not a contractual offer; services are confirmed when a booking is accepted.\n\nmiProgram is a separate company. miProgram licences are optional, are provided under miProgram\'s own terms, and are billed directly by miProgram.',
    },
  ],
};

// ─── Placeholders ───────────────────────────────────────────────

export type QuotePlaceholderValues = Partial<Record<string, string>>;

/** Replace {placeholders}; unknown or empty ones are left as-is so they're easy to spot */
export function fillPlaceholders(text: string, values: QuotePlaceholderValues): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => values[key] || match);
}

// ─── Plain text → blocks ────────────────────────────────────────

export type TextBlock = { type: 'paragraph'; text: string } | { type: 'bullets'; items: string[] };

/** Blank lines separate paragraphs; "- " lines become bullet lists */
export function textToBlocks(text: string): TextBlock[] {
  const blocks: TextBlock[] = [];
  for (const chunk of text.replace(/\r\n/g, '\n').split(/\n\s*\n/)) {
    const lines = chunk.split('\n').map((line) => line.trim()).filter(Boolean);
    if (lines.length === 0) continue;
    if (lines.every((line) => /^[-•*]\s+/.test(line))) {
      blocks.push({ type: 'bullets', items: lines.map((line) => line.replace(/^[-•*]\s+/, '')) });
    } else {
      blocks.push({ type: 'paragraph', text: lines.join('\n') });
    }
  }
  return blocks;
}
