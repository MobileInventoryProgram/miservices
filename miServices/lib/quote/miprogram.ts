import { formatPrice } from '@/lib/pricing';
import type { MiProgramSettings } from '@/lib/quote/template';

/**
 * miProgram licence table: published tiers with the miServices-client
 * discount applied, and the client's own tier picked out by property count.
 */

export interface MiProgramRow {
  label: string;
  monthly: string;
  annual: string;
  discountedMonthly: string;
  discountedAnnual: string;
  highlighted: boolean;
}

export interface MiProgramTable {
  discountPercent: number;
  rows: MiProgramRow[];
  /** e.g. "For your 40 properties: £30 → £15 a month (£150 a year)" */
  callout: string | null;
  note: string;
  url: string;
}

const discounted = (amount: number, percent: number) => Math.round(amount * (1 - percent / 100) * 100) / 100;

export function buildMiProgramTable(settings: MiProgramSettings, propertyCount?: number | null): MiProgramTable {
  const tiers = [...settings.tiers].sort((a, b) => a.upTo - b.upTo);
  const count = propertyCount != null && propertyCount > 0 ? propertyCount : null;
  const match = count != null ? tiers.find((tier) => count <= tier.upTo) : undefined;

  const rows: MiProgramRow[] = tiers.map((tier) => ({
    label: `Up to ${tier.upTo.toLocaleString('en-GB')}`,
    monthly: formatPrice(tier.monthly),
    annual: formatPrice(tier.annual),
    discountedMonthly: formatPrice(discounted(tier.monthly, settings.discountPercent)),
    discountedAnnual: formatPrice(discounted(tier.annual, settings.discountPercent)),
    highlighted: tier === match,
  }));

  const largest = tiers[tiers.length - 1];
  rows.push({
    label: `Over ${largest ? largest.upTo.toLocaleString('en-GB') : '—'}`,
    monthly: 'Talk to us',
    annual: 'Talk to us',
    discountedMonthly: 'Talk to us',
    discountedAnnual: 'Talk to us',
    highlighted: count != null && !match,
  });

  let callout: string | null = null;
  if (count != null && match) {
    const properties = `${count.toLocaleString('en-GB')} ${count === 1 ? 'property' : 'properties'}`;
    callout = `For your ${properties}: ${formatPrice(match.monthly)} a month, reduced to ${formatPrice(
      discounted(match.monthly, settings.discountPercent)
    )} a month (${formatPrice(discounted(match.annual, settings.discountPercent))} a year) with your miServices discount.`;
  } else if (count != null) {
    callout = `For portfolios of ${count.toLocaleString('en-GB')} properties, miProgram will provide a tailored price — your ${settings.discountPercent}% miServices discount still applies.`;
  }

  return { discountPercent: settings.discountPercent, rows, callout, note: settings.note, url: settings.url };
}
