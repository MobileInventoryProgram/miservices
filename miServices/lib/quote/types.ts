/** Quote shapes and status helpers, safe to use in client components. */

import type { QuoteSectionMode } from '@/lib/quote/template';

export type QuoteStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired';

export interface QuoteSection {
  _key?: string;
  key: string;
  title: string;
  mode: QuoteSectionMode;
  text: string;
}

export interface QuoteContactInfo {
  _id: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  postcode?: string;
}

export interface QuoteFranchiseInfo {
  _id: string;
  companyName?: string;
  territory?: string;
  slug?: string;
  owners?: { firstName?: string; lastName?: string; email?: string; phone?: string }[];
}

export interface Quote {
  _id: string;
  reference?: string;
  status: Exclude<QuoteStatus, 'expired'>;
  propertyCount?: number;
  jobTypes?: string[];
  sections?: QuoteSection[];
  emailSubject?: string;
  emailMessage?: string;
  validUntil?: string;
  shareToken?: string;
  sentTo?: string;
  priceSnapshot?: string;
  templateSnapshot?: string;
  createdAt?: string;
  updatedAt?: string;
  sentAt?: string;
  viewedAt?: string;
  respondedAt?: string;
  respondedByName?: string;
  declineReason?: string;
  priceListId?: string;
  priceListTitle?: string;
  contact?: QuoteContactInfo | null;
  franchise: QuoteFranchiseInfo;
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
}

export const QUOTE_STATUSES: { value: QuoteStatus; label: string; badge: string }[] = [
  { value: 'draft', label: 'Draft', badge: 'bg-gray-100 text-gray-700 border-gray-200' },
  { value: 'sent', label: 'Sent', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'viewed', label: 'Viewed', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { value: 'accepted', label: 'Accepted', badge: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'declined', label: 'Declined', badge: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'expired', label: 'Expired', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
];

/** Status as shown: sent/viewed quotes past their validity date read as expired */
export function effectiveStatus(quote: Pick<Quote, 'status' | 'validUntil'>, today = new Date()): QuoteStatus {
  if ((quote.status === 'sent' || quote.status === 'viewed') && quote.validUntil) {
    const end = new Date(`${quote.validUntil}T23:59:59`);
    if (end < today) return 'expired';
  }
  return quote.status;
}

export function quoteStatusInfo(status: QuoteStatus) {
  return QUOTE_STATUSES.find((s) => s.value === status) || QUOTE_STATUSES[0];
}

export function quoteClientName(quote: Pick<Quote, 'contact'>): string {
  const c = quote.contact;
  if (!c) return 'No client';
  return [c.firstName, c.lastName].filter(Boolean).join(' ') || c.companyName || 'Unnamed client';
}

export function formatQuoteDate(value?: string): string {
  if (!value) return '—';
  const date = value.length === 10 ? new Date(`${value}T12:00:00`) : new Date(value);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
