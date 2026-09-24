/**
 * Job types a client can be interested in. Shared by contacts and quotes.
 * `serviceTypes` links each to the price list service types in lib/pricing.ts.
 */
export const JOB_TYPES = [
  { value: 'inventory', label: 'Inventory', serviceTypes: ['inventory'] },
  { value: 'check-in', label: 'Check-in', serviceTypes: ['combined', 'checkin'] },
  { value: 'check-out', label: 'Check-out', serviceTypes: ['checkout'] },
  { value: 'mid-term', label: 'Mid-term inspection', serviceTypes: ['midterm'] },
  { value: 'property-visit', label: 'Property visit', serviceTypes: [] },
  { value: 'virtual-tour', label: 'Virtual tour & floor plan', serviceTypes: ['virtualTourBundle', 'virtualTourFloorplan', 'floorplan'] },
  { value: 'block-management', label: 'Block management', serviceTypes: [] },
] as const;

export type JobType = (typeof JOB_TYPES)[number]['value'];

export const JOB_TYPE_VALUES: string[] = JOB_TYPES.map((job) => job.value);

export function jobTypeLabel(value: string): string {
  return JOB_TYPES.find((job) => job.value === value)?.label || value;
}
