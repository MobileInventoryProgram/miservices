/**
 * Compliance settings shared by the Studio schemas and the Members Area.
 * Plain values only, so the Studio can import this file.
 */
export const COMPLIANCE_CATEGORIES = [
  { value: 'setup', title: 'Setting up' },
  { value: 'insurance', title: 'Insurance & legal' },
  { value: 'reporting', title: 'Monthly reporting' },
  { value: 'training', title: 'Training' },
  { value: 'standards', title: 'Operations & standards' },
  { value: 'data', title: 'Data protection' },
  { value: 'fees', title: 'Fees' },
] as const;

export const COMPLIANCE_FREQUENCIES = [
  { value: 'once', title: 'Once' },
  { value: 'annual', title: 'Every year' },
  { value: 'monthly', title: 'Every month' },
  { value: 'weekly', title: 'Every week' },
  { value: 'ongoing', title: 'Ongoing (confirmed each year)' },
] as const;

export const COMPLIANCE_EVIDENCE = [
  { value: 'upload', title: 'Franchisee uploads a document' },
  { value: 'confirm', title: 'Franchisee confirms' },
  { value: 'admin', title: 'Head Office ticks it off' },
] as const;

export const RECORD_STATUSES = [
  { value: 'submitted', title: 'Awaiting review' },
  { value: 'approved', title: 'Approved' },
  { value: 'returned', title: 'Returned' },
  { value: 'notApplicable', title: 'Not applicable' },
] as const;

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export type ComplianceCategory = (typeof COMPLIANCE_CATEGORIES)[number]['value'];
export type ComplianceFrequency = (typeof COMPLIANCE_FREQUENCIES)[number]['value'];
export type ComplianceEvidence = (typeof COMPLIANCE_EVIDENCE)[number]['value'];
export type RecordStatus = (typeof RECORD_STATUSES)[number]['value'];

export const categoryTitle = (value: string) => COMPLIANCE_CATEGORIES.find((c) => c.value === value)?.title || 'Other';
export const frequencyTitle = (value: string) => COMPLIANCE_FREQUENCIES.find((f) => f.value === value)?.title || value;
