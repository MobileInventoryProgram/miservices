import { JOB_TYPE_VALUES } from '@/lib/job-types';
import { CLIENT_TYPES, CONTACT_STATUSES } from '@/lib/crm/options';

/** Editable contact fields, as saved to Sanity */
export interface ContactInput {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  clientType: string | null;
  propertyCount: number | null;
  jobTypes: string[];
  status: string;
  notes: string;
  /** Agreed to Head Office marketing emails (saved into the contact's `marketing` record) */
  marketingConsent: boolean;
}

const text = (value: unknown, max = 200) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

/**
 * Validate a contact from a form or API body. Returns the cleaned fields,
 * or an error message suitable for showing to the member.
 */
export function parseContactInput(body: unknown): { data?: ContactInput; error?: string } {
  if (!body || typeof body !== 'object') return { error: 'Invalid request' };
  const input = body as Record<string, unknown>;

  const data: ContactInput = {
    firstName: text(input.firstName, 100),
    lastName: text(input.lastName, 100),
    companyName: text(input.companyName, 150),
    email: text(input.email, 200).toLowerCase(),
    phone: text(input.phone, 50),
    address: text(input.address, 500),
    postcode: text(input.postcode, 12).toUpperCase(),
    clientType: CLIENT_TYPES.some((type) => type.value === input.clientType) ? (input.clientType as string) : null,
    propertyCount: null,
    jobTypes: Array.isArray(input.jobTypes)
      ? Array.from(new Set(input.jobTypes.filter((job): job is string => typeof job === 'string' && JOB_TYPE_VALUES.includes(job))))
      : [],
    status: CONTACT_STATUSES.some((status) => status.value === input.status) ? (input.status as string) : 'lead',
    notes: text(input.notes, 5000),
    marketingConsent: input.marketingConsent === true,
  };

  if (!data.firstName && !data.lastName && !data.companyName) {
    return { error: 'Please enter a client name or company name.' };
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { error: 'Please enter a valid email address.' };
  }
  if (data.marketingConsent && !data.email) {
    return { error: 'Add an email address to sign this contact up to marketing emails.' };
  }

  if (input.propertyCount !== undefined && input.propertyCount !== null && input.propertyCount !== '') {
    const count = Number(input.propertyCount);
    if (!Number.isInteger(count) || count < 0 || count > 100000) {
      return { error: 'Number of properties must be a whole number.' };
    }
    data.propertyCount = count;
  }

  return { data };
}
