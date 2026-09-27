import { addDays, daysBetween, isDate, MAX_RANGE_DAYS } from './timesheets';

/** Today's date in the UK (ServiceM8 times are UK local) */
function ukToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date());
}

/**
 * Date range from the query string: defaults to this month so far. Returns
 * an error message for a range that's back to front or too long.
 */
export function parseRange(fromParam?: string | null, toParam?: string | null) {
  const today = ukToday();
  const from = fromParam && isDate(fromParam) ? fromParam : `${today.slice(0, 7)}-01`;
  const to = toParam && isDate(toParam) ? toParam : today;
  let error: string | null = null;
  if (to < from) error = 'The end date is before the start date.';
  else if (daysBetween(from, to) >= MAX_RANGE_DAYS) error = `Pick a range of up to ${MAX_RANGE_DAYS} days.`;
  return { from, to, today, error, yearStart: `${today.slice(0, 4)}-01-01`, lastMonth: addDays(`${today.slice(0, 7)}-01`, -1) };
}
