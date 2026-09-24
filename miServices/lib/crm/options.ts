/** Contact field options, shared by the Sanity schema, forms, filters and API validation. */

export const CLIENT_TYPES = [
  { value: 'letting-agent', label: 'Letting agent' },
  { value: 'landlord', label: 'Landlord' },
  { value: 'property-manager', label: 'Property manager' },
  { value: 'block-management', label: 'Block management' },
  { value: 'other', label: 'Other' },
] as const;

export const CONTACT_STATUSES = [
  { value: 'lead', label: 'Lead', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'prospect', label: 'Prospect', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'client', label: 'Client', badge: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'lost', label: 'Lost', badge: 'bg-gray-100 text-gray-600 border-gray-200' },
] as const;

export type ClientType = (typeof CLIENT_TYPES)[number]['value'];
export type ContactStatus = (typeof CONTACT_STATUSES)[number]['value'];

export function clientTypeLabel(value?: string | null): string {
  return CLIENT_TYPES.find((type) => type.value === value)?.label || '';
}

export function contactStatus(value?: string | null) {
  return CONTACT_STATUSES.find((status) => status.value === value) || CONTACT_STATUSES[0];
}
