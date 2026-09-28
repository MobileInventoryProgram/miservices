/** Contact shapes and helpers, safe to use in client components. */

export interface Contact {
  _id: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  postcode?: string;
  clientType?: string;
  propertyCount?: number;
  jobTypes?: string[];
  status?: string;
  source?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  franchiseId: string;
  franchiseName?: string;
  ownerId?: string;
  ownerName?: string;
  marketing?: ContactMarketing;
}

/** Consent to Head Office marketing emails, and how the Resend list stands */
export interface ContactMarketing {
  consent?: boolean;
  consentAt?: string;
  consentBy?: string;
  consentSource?: string;
  unsubscribedAt?: string | null;
  syncedAt?: string;
  syncError?: string;
}

export type MarketingState = 'subscribed' | 'unsubscribed' | 'none';

export function marketingState(m: ContactMarketing | undefined): MarketingState {
  if (m?.unsubscribedAt) return 'unsubscribed';
  return m?.consent ? 'subscribed' : 'none';
}

export function contactName(contact: Pick<Contact, 'firstName' | 'lastName' | 'companyName'>): string {
  return [contact.firstName, contact.lastName].filter(Boolean).join(' ') || contact.companyName || 'Unnamed contact';
}

/** Franchises that have contacts, for the Head Office franchise filter */
export function franchisesIn(contacts: Contact[]): { id: string; name: string }[] {
  const seen = new Map<string, string>();
  for (const contact of contacts) {
    if (contact.franchiseId && !seen.has(contact.franchiseId)) {
      seen.set(contact.franchiseId, contact.franchiseName || 'Unknown franchise');
    }
  }
  return Array.from(seen, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
}

// ─── Form values ─────────────────────────────────────────────────

export interface ContactFormValues {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  clientType: string;
  propertyCount: string;
  jobTypes: string[];
  status: string;
  notes: string;
  marketingConsent: boolean;
  /** Read only: they unsubscribed through an email, so only they can sign up again */
  marketingUnsubscribed?: boolean;
}

export const EMPTY_CONTACT: ContactFormValues = {
  firstName: '',
  lastName: '',
  companyName: '',
  email: '',
  phone: '',
  address: '',
  postcode: '',
  clientType: '',
  propertyCount: '',
  jobTypes: [],
  status: 'lead',
  notes: '',
  marketingConsent: false,
};

/** Contact record → form values */
export function contactToForm(contact: Partial<Contact>): ContactFormValues {
  return {
    firstName: contact.firstName || '',
    lastName: contact.lastName || '',
    companyName: contact.companyName || '',
    email: contact.email || '',
    phone: contact.phone || '',
    address: contact.address || '',
    postcode: contact.postcode || '',
    clientType: contact.clientType || '',
    propertyCount: contact.propertyCount != null ? String(contact.propertyCount) : '',
    jobTypes: contact.jobTypes || [],
    status: contact.status || 'lead',
    notes: contact.notes || '',
    marketingConsent: !!contact.marketing?.consent,
    marketingUnsubscribed: !!contact.marketing?.unsubscribedAt,
  };
}
