/**
 * Help Centre topics. Plain values only, so the Studio schema can import them;
 * icons are CmsIcon names (lib/cms/icon-names.ts).
 */
export const HELP_TOPICS = [
  { value: 'getting-started', title: 'Getting started & daily work', icon: 'clipboard', description: 'Your day, bookings, keys and the office routine' },
  { value: 'inspections', title: 'Inspections & reports', icon: 'search', description: 'Inventories, check-ins, check-outs and the AIP standard' },
  { value: 'pricing-sales', title: 'Pricing, quoting & sales', icon: 'pound', description: 'Prices, quotes and winning new clients' },
  { value: 'marketing', title: 'Marketing', icon: 'trendingUp', description: 'Promoting your franchise and the brand' },
  { value: 'staff-hr', title: 'Staff, HR & pay', icon: 'users', description: 'Holidays, sickness, contracts, appraisals and conduct' },
  { value: 'vehicles', title: 'Vehicles', icon: 'key', description: 'Company vehicle rules and driving' },
  { value: 'policies', title: 'Data protection & policies', icon: 'shield', description: 'GDPR, equality and company policies' },
  { value: 'members-area', title: 'Using the Members Area', icon: 'helpCircle', description: 'Quotes, contacts, pricing and your profile' },
] as const;

export type HelpTopic = (typeof HELP_TOPICS)[number]['value'];

export function helpTopic(value: string | undefined) {
  return HELP_TOPICS.find((t) => t.value === value) || null;
}
