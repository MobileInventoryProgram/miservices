import { addDays, daysBetween, formatUkDate, isDate } from '@/lib/dates';

/** A franchise's contract with Head Office (admin only) */
export interface FranchiseContract {
  startDate?: string | null;
  termYears?: number | null;
  expiryDate?: string | null;
  renewalNoticeMonths?: number | null;
  feeType?: 'percentage' | 'fixed' | null;
  feePercent?: number | null;
  feeMonthly?: number | null;
  notes?: string | null;
}

export type ContractState = 'notSet' | 'active' | 'renewalDue' | 'expired';

export const DEFAULT_NOTICE_MONTHS = 6;
export const DEFAULT_FEE_PERCENT = 10;

/** A date plus or minus whole months, kept to the month's last day where needed (31 Aug + 6 months = 28/29 Feb) */
export function addMonthsToDate(date: string, months: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const total = y * 12 + (m - 1) + months;
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${year}-${String(month).padStart(2, '0')}-${String(Math.min(d, last)).padStart(2, '0')}`;
}

/** Expiry: as entered, or worked out from the start date and term (the day before the anniversary) */
export function contractExpiry(c: FranchiseContract | null | undefined): string | null {
  if (!c) return null;
  if (c.expiryDate && isDate(c.expiryDate)) return c.expiryDate;
  if (c.startDate && isDate(c.startDate) && c.termYears && c.termYears > 0) return addDays(addMonthsToDate(c.startDate, Math.round(c.termYears * 12)), -1);
  return null;
}

export function contractInfo(c: FranchiseContract | null | undefined, today: string) {
  const expiry = contractExpiry(c);
  const notice = c?.renewalNoticeMonths ?? DEFAULT_NOTICE_MONTHS;
  const renewalFrom = expiry ? addMonthsToDate(expiry, -notice) : null;
  let state: ContractState = 'notSet';
  if (expiry) state = expiry < today ? 'expired' : renewalFrom && today >= renewalFrom ? 'renewalDue' : 'active';
  return { state, expiry, renewalFrom, notice, daysToExpiry: expiry ? daysBetween(today, expiry) : null };
}

/** "10% of turnover", "£350 a month", or null when not set */
export function feeText(c: FranchiseContract | null | undefined): string | null {
  if (!c?.feeType) return null;
  if (c.feeType === 'percentage') return `${c.feePercent ?? DEFAULT_FEE_PERCENT}% of turnover`;
  return c.feeMonthly != null ? `£${c.feeMonthly.toLocaleString('en-GB', { minimumFractionDigits: c.feeMonthly % 1 ? 2 : 0, maximumFractionDigits: 2 })} a month` : 'Fixed monthly fee';
}

/** "in 1 year 5 months", "in 12 days", "3 months ago" */
export function timeUntil(from: string, to: string): string {
  const days = daysBetween(from, to);
  const past = days < 0;
  const a = past ? to : from;
  const b = past ? from : to;
  let months = 0;
  while (addMonthsToDate(a, months + 1) <= b) months++;
  const text =
    months >= 12
      ? `${Math.floor(months / 12)} year${Math.floor(months / 12) === 1 ? '' : 's'}${months % 12 ? ` ${months % 12} month${months % 12 === 1 ? '' : 's'}` : ''}`
      : months >= 1
        ? `${months} month${months === 1 ? '' : 's'}`
        : `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`;
  if (days === 0) return 'today';
  return past ? `${text} ago` : `in ${text}`;
}

export const CONTRACT_STATE_STYLES: Record<ContractState, { label: string; className: string }> = {
  notSet: { label: 'Not set', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  active: { label: 'Active', className: 'bg-green-50 text-green-700 border-green-200' },
  renewalDue: { label: 'Renewal due', className: 'bg-amber-50 text-amber-800 border-amber-200' },
  expired: { label: 'Expired', className: 'bg-red-50 text-red-700 border-red-200' },
};

export { formatUkDate };

const num = (v: unknown) => (v === '' || v === null || v === undefined ? null : typeof v === 'number' ? v : Number(String(v).replace(/[£,%\s]/g, '')));

/** Check a contract sent from the form; the saved object, or an error for Head Office to fix */
export function readContract(body: Record<string, unknown>): { contract: FranchiseContract } | { error: string } {
  const date = (v: unknown, label: string) => {
    if (v === '' || v == null) return null;
    if (typeof v !== 'string' || !isDate(v)) throw new Error(`${label} isn't a valid date.`);
    return v;
  };
  try {
    const startDate = date(body.startDate, 'The start date');
    const expiryInput = date(body.expiryDate, 'The expiry date');
    const termYears = num(body.termYears);
    if (termYears !== null && (!Number.isFinite(termYears) || termYears <= 0 || termYears > 50)) return { error: 'The term should be between 1 and 50 years.' };
    if (termYears !== null && !startDate && !expiryInput) return { error: 'Add a start date to work out the expiry from the term.' };
    const notice = num(body.renewalNoticeMonths);
    if (notice !== null && (!Number.isInteger(notice) || notice < 0 || notice > 36)) return { error: 'The renewal notice should be 0 to 36 whole months.' };

    const feeType = body.feeType === 'percentage' || body.feeType === 'fixed' ? body.feeType : null;
    if (body.feeType && !feeType) return { error: 'Choose a percentage or a fixed monthly fee.' };
    const feePercent = num(body.feePercent);
    const feeMonthly = num(body.feeMonthly);
    if (feeType === 'percentage' && (feePercent === null || !Number.isFinite(feePercent) || feePercent <= 0 || feePercent > 100)) return { error: 'The percentage should be more than 0 and up to 100.' };
    if (feeType === 'fixed' && (feeMonthly === null || !Number.isFinite(feeMonthly) || feeMonthly <= 0 || feeMonthly > 1_000_000)) return { error: 'Enter the monthly fee in pounds.' };

    const contract: FranchiseContract = {
      startDate,
      termYears: expiryInput ? null : termYears,
      expiryDate: expiryInput,
      renewalNoticeMonths: notice ?? DEFAULT_NOTICE_MONTHS,
      feeType,
      feePercent: feeType === 'percentage' ? feePercent : null,
      feeMonthly: feeType === 'fixed' ? Math.round(feeMonthly! * 100) / 100 : null,
      notes: typeof body.notes === 'string' ? body.notes.trim().slice(0, 2000) || null : null,
    };
    const expiry = contractExpiry(contract);
    if (startDate && expiry && expiry <= startDate) return { error: 'The expiry date must be after the start date.' };
    return { contract };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
