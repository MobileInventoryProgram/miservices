import { addDays, addMonths, dayOfMonth, formatUkDate, isoWeek } from '@/lib/dates';
import type { ComplianceFrequency } from './options';

/** The due-date rules of a requirement */
export interface DueRule {
  frequency: ComplianceFrequency;
  /** Once: due this many days after the franchise joined (none = no deadline) */
  dueWithinDays?: number | null;
  /** Monthly: 1–28, or 0 for the last day of the month */
  monthlyDay?: number | null;
  /** Monthly: due in the month after the period (e.g. invoices) */
  monthOffset?: boolean | null;
  /** Weekly: 1 = Monday … 7 = Sunday */
  weeklyDay?: number | null;
  /** Annual on a fixed date (when there's no expiry date) */
  annualMonth?: number | null;
  annualDay?: number | null;
  /** Annual uploads with an expiry: due again when it expires */
  askExpiry?: boolean | null;
}

export interface Period {
  key: string;
  /** Shown to people, e.g. "September 2026" */
  label: string;
  due: string | null;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Rules where each period is its own item (monthly, weekly, annual on a fixed
 * date). Annual items with an expiry date, or with no fixed date, instead run
 * for a year from when they were done.
 */
export function isCalendarRule(rule: DueRule): boolean {
  return rule.frequency === 'monthly' || rule.frequency === 'weekly' || (rule.frequency === 'annual' && !rule.askExpiry && !!rule.annualMonth);
}

function monthlyPeriod(month: string, rule: DueRule): Period {
  const [y, m] = month.split('-').map(Number);
  const dueMonth = rule.monthOffset ? addMonths(month, 1) : month;
  const [dy, dm] = dueMonth.split('-').map(Number);
  return { key: month, label: `${MONTH_NAMES[m - 1]} ${y}`, due: dayOfMonth(dy, dm, rule.monthlyDay ?? 0) };
}

function weeklyPeriod(monday: string, rule: DueRule): Period {
  const { key } = isoWeek(monday);
  return { key, label: `Week of ${formatUkDate(monday)}`, due: addDays(monday, Math.min(Math.max(rule.weeklyDay || 5, 1), 7) - 1) };
}

function annualPeriod(year: number, rule: DueRule): Period {
  return { key: String(year), label: String(year), due: dayOfMonth(year, rule.annualMonth || 12, rule.annualDay || 0) };
}

/**
 * The calendar periods to show for a recurring requirement: every period from
 * `start` up to and including the first one due on or after today (so older
 * unfinished ones show as overdue), at most `max` of them, newest last.
 */
export function calendarPeriods(rule: DueRule, today: string, start: string, max = 12): Period[] {
  const periods: Period[] = [];
  const push = (p: Period) => {
    periods.push(p);
    return !!p.due && p.due >= today; // stop once we reach the current one
  };

  if (rule.frequency === 'monthly') {
    // A period can be due in the month after, so start one month back
    let month = rule.monthOffset ? addMonths(start.slice(0, 7), -1) : start.slice(0, 7);
    for (let i = 0; i < 240; i++, month = addMonths(month, 1)) {
      const p = monthlyPeriod(month, rule);
      if (p.due && p.due < start) continue;
      if (push(p)) break;
    }
  } else if (rule.frequency === 'weekly') {
    let monday = isoWeek(start).monday;
    for (let i = 0; i < 520; i++, monday = addDays(monday, 7)) {
      const p = weeklyPeriod(monday, rule);
      if (p.due && p.due < start) continue;
      if (push(p)) break;
    }
  } else {
    for (let year = Number(start.slice(0, 4)); year < Number(start.slice(0, 4)) + 50; year++) {
      const p = annualPeriod(year, rule);
      if (p.due && p.due < start) continue;
      if (push(p)) break;
    }
  }
  return periods.slice(-max);
}

/**
 * First due date of a one-off (or not-yet-done yearly) requirement: N days
 * after `from`, the later of when the franchise joined and when the
 * requirement was added, so existing franchises aren't overdue on day one.
 */
export function onceDue(rule: DueRule, from: string): string | null {
  return rule.dueWithinDays ? addDays(from, rule.dueWithinDays) : null;
}
