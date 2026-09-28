/**
 * Calendar dates as 'YYYY-MM-DD' strings, worked out in UK time. Safe on the
 * server and in the browser.
 */

/** Today's date in the UK */
export function ukToday(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(now);
}

const toDate = (date: string) => new Date(`${date}T00:00:00Z`);
const toString = (d: Date) => d.toISOString().slice(0, 10);

export function addDays(date: string, days: number): string {
  const d = toDate(date);
  d.setUTCDate(d.getUTCDate() + days);
  return toString(d);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((toDate(to).getTime() - toDate(from).getTime()) / 86_400_000);
}

export function isDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(toDate(value).getTime());
}

/** Number of days in a month (month 1–12) */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** A day in a month, clamped to the month's length; day 0 means the last day */
export function dayOfMonth(year: number, month: number, day: number): string {
  const last = daysInMonth(year, month);
  const d = day <= 0 ? last : Math.min(day, last);
  return `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** 'YYYY-MM' plus or minus months */
export function addMonths(month: string, count: number): string {
  const [y, m] = month.split('-').map(Number);
  const total = y * 12 + (m - 1) + count;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
}

/** ISO week: its key ('2026-W40') and Monday */
export function isoWeek(date: string): { key: string; monday: string } {
  const d = toDate(date);
  const weekday = (d.getUTCDay() + 6) % 7; // Monday = 0
  const monday = addDays(date, -weekday);
  const thursday = toDate(addDays(monday, 3));
  const year = thursday.getUTCFullYear();
  const jan4 = toDate(`${year}-01-04`);
  const week1Monday = addDays(toString(jan4), -((jan4.getUTCDay() + 6) % 7));
  const week = Math.floor(daysBetween(week1Monday, monday) / 7) + 1;
  return { key: `${year}-W${String(week).padStart(2, '0')}`, monday };
}

/** 'Tuesday 30 September 2026' style, or shorter */
export function formatUkDate(date: string | null | undefined, style: 'long' | 'short' = 'short'): string {
  if (!date || !isDate(date)) return '—';
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', {
    timeZone: 'UTC',
    day: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    year: 'numeric',
    ...(style === 'long' ? { weekday: 'long' as const } : {}),
  });
}
