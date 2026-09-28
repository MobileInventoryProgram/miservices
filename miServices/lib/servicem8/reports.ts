import type { Job, JobMaterial, Reference } from './data';
import { addDays, daysBetween, type TimesheetData } from './timesheets';

/**
 * The ServiceM8 reports, worked out from pulled records. Pure functions:
 * no fetching, so they can be checked against known data.
 */

const round = (n: number, dp = 2) => Math.round(n * 10 ** dp) / 10 ** dp;
const day = (stamp: string | null) => (stamp ? stamp.slice(0, 10) : null);
const sum = <T>(rows: T[], f: (r: T) => number) => rows.reduce((n, r) => n + f(r), 0);

export const NO_CATEGORY = 'No job type';
export const NO_CLIENT = 'No client';

const categoryName = (ref: Reference, id: string) => (id && ref.categories.get(id)) || NO_CATEGORY;
const clientName = (ref: Reference, id: string) => (id && ref.clients.get(id)) || NO_CLIENT;

/** Change from one figure to another, as a fraction (null when there's nothing to compare with) */
export function change(now: number, before: number): number | null {
  return before > 0 ? (now - before) / before : null;
}

// ─── Overview ───────────────────────────────────────────────────────────────

export interface Bucket {
  key: string;
  label: string;
  from: string;
  to: string;
  value: number;
  jobs: number;
}

export interface CategoryRow {
  id: string;
  name: string;
  jobs: number;
  value: number;
  share: number;
  average: number;
}

export interface Overview {
  value: number;
  jobs: number;
  priced: number;
  average: number;
  previous: { value: number; jobs: number; average: number };
  /** Weeks for ranges up to ~3 months, otherwise months */
  interval: 'week' | 'month';
  buckets: Bucket[];
  categories: CategoryRow[];
  /** New jobs created in the range, and how many have gone ahead so far */
  created: number;
  createdGoneAhead: number;
  /** Completed jobs with no value in ServiceM8 (billed elsewhere), by client */
  unpriced: { jobs: number; clients: { id: string; name: string; jobs: number }[] };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dm = (d: string) => `${Number(d.slice(8, 10))} ${MONTHS[Number(d.slice(5, 7)) - 1]}`;

/** Monday of the week a date falls in */
function monday(date: string): string {
  const dow = new Date(`${date}T12:00:00Z`).getUTCDay();
  return addDays(date, -((dow + 6) % 7));
}

/** Empty weekly or monthly buckets covering the range */
export function buckets(from: string, to: string): { interval: 'week' | 'month'; buckets: Bucket[] } {
  const interval = daysBetween(from, to) <= 92 ? 'week' : 'month';
  const out: Bucket[] = [];
  if (interval === 'week') {
    for (let start = monday(from); start <= to; start = addDays(start, 7)) {
      const s = start < from ? from : start;
      const e = addDays(start, 6) > to ? to : addDays(start, 6);
      out.push({ key: start, label: s === e ? dm(s) : `${dm(s)}–${dm(e)}`, from: s, to: e, value: 0, jobs: 0 });
    }
  } else {
    for (let start = `${from.slice(0, 7)}-01`; start <= to; ) {
      const [y, m] = start.split('-').map(Number);
      const next = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`;
      const e = addDays(next, -1) > to ? to : addDays(next, -1);
      out.push({ key: start, label: `${MONTHS[m - 1]} ${y}`, from: start < from ? from : start, to: e, value: 0, jobs: 0 });
      start = next;
    }
  }
  return { interval, buckets: out };
}

export function categoryRows(jobs: Job[], ref: Reference): CategoryRow[] {
  const total = sum(jobs, (j) => j.value);
  const map = new Map<string, CategoryRow>();
  for (const j of jobs) {
    const row = map.get(j.categoryId) || { id: j.categoryId, name: categoryName(ref, j.categoryId), jobs: 0, value: 0, share: 0, average: 0 };
    row.jobs++;
    row.value += j.value;
    map.set(j.categoryId, row);
  }
  return Array.from(map.values())
    .map((r) => ({ ...r, value: round(r.value), share: total ? r.value / total : 0, average: r.jobs ? round(r.value / r.jobs) : 0 }))
    .sort((a, b) => b.value - a.value || b.jobs - a.jobs);
}

function totals(jobs: Job[]) {
  const value = round(sum(jobs, (j) => j.value));
  const priced = jobs.filter((j) => j.value > 0).length;
  return { value, jobs: jobs.length, priced, average: priced ? round(value / priced) : 0 };
}

/** Completed jobs ServiceM8 has no value for, grouped by client */
export function unpricedByClient(completed: Job[], ref: Reference) {
  const zero = completed.filter((j) => j.value <= 0);
  const byClient = new Map<string, { id: string; name: string; jobs: number }>();
  for (const j of zero) {
    const r = byClient.get(j.clientId) || { id: j.clientId, name: clientName(ref, j.clientId), jobs: 0 };
    r.jobs++;
    byClient.set(j.clientId, r);
  }
  return { jobs: zero.length, clients: Array.from(byClient.values()).sort((a, b) => b.jobs - a.jobs) };
}

export function overview(completed: Job[], previous: Job[], dated: Job[], from: string, to: string, ref: Reference): Overview {
  const { interval, buckets: slots } = buckets(from, to);
  for (const j of completed) {
    const d = day(j.completedAt)!;
    const slot = slots.find((b) => d >= b.from && d <= b.to);
    if (slot) {
      slot.value += j.value;
      slot.jobs++;
    }
  }
  const now = totals(completed);
  const before = totals(previous);
  return {
    ...now,
    previous: { value: before.value, jobs: before.jobs, average: before.average },
    interval,
    buckets: slots.map((b) => ({ ...b, value: round(b.value) })),
    categories: categoryRows(completed, ref),
    created: dated.length,
    createdGoneAhead: dated.filter((j) => j.status === 'Completed' || j.status === 'Work Order').length,
    unpriced: unpricedByClient(completed, ref),
  };
}

// ─── Pipeline ───────────────────────────────────────────────────────────────

export const AGE_BANDS = [
  { key: '0-30', label: 'Up to 30 days', max: 30 },
  { key: '31-60', label: '31–60 days', max: 60 },
  { key: '61-90', label: '61–90 days', max: 90 },
  { key: '90+', label: 'Over 90 days', max: Infinity },
] as const;

export type AgeBand = (typeof AGE_BANDS)[number]['key'];

export function ageBand(days: number): AgeBand {
  return AGE_BANDS.find((b) => days <= b.max)!.key;
}

export interface OpenJobRow {
  id: string;
  number: string;
  status: string;
  date: string | null;
  ageDays: number | null;
  client: string;
  category: string;
  value: number;
  postcode: string;
}

export interface Pipeline {
  /** By age since the job was created (jobs are mostly priced only when completed, so no values here) */
  quotes: { count: number; bands: Record<AgeBand, number> };
  booked: { count: number; bands: Record<AgeBand, number> };
  /** Jobs created in the range: gone ahead (booked or done), unsuccessful, or still at the quote stage */
  conversion: { created: number; won: number; lost: number; waiting: number; rate: number | null };
  /** Unsuccessful jobs, plus completed ones charged as aborted/cancelled, by job type */
  lost: { name: string; unsuccessful: number; chargedCancellation: number }[];
  open: OpenJobRow[];
}

const CANCELLATION = /abort|cancel/i;

function openRow(j: Job, ref: Reference, today: string): OpenJobRow {
  const d = day(j.date);
  return {
    id: j.id,
    number: j.number,
    status: j.status,
    date: day(j.date),
    ageDays: d ? Math.max(0, daysBetween(d, today)) : null,
    client: clientName(ref, j.clientId),
    category: categoryName(ref, j.categoryId),
    value: j.value,
    postcode: j.postcode,
  };
}

export function pipeline(open: Job[], dated: Job[], completedInRange: Job[], ref: Reference, today: string): Pipeline {
  const quotes = open.filter((j) => j.status === 'Quote');
  const booked = open.filter((j) => j.status !== 'Quote');
  const rows = open.map((j) => openRow(j, ref, today));
  const bandsFor = (status: 'Quote' | 'booked') => {
    const bands = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 } as Record<AgeBand, number>;
    rows.filter((r) => (status === 'Quote') === (r.status === 'Quote') && r.ageDays !== null).forEach((r) => bands[ageBand(r.ageDays!)]++);
    return bands;
  };

  const won = dated.filter((j) => j.status === 'Completed' || j.status === 'Work Order').length;
  const lostCount = dated.filter((j) => j.status === 'Unsuccessful').length;
  const decided = won + lostCount;

  const lost = new Map<string, { name: string; unsuccessful: number; chargedCancellation: number }>();
  const bump = (j: Job, key: 'unsuccessful' | 'chargedCancellation') => {
    const name = categoryName(ref, j.categoryId);
    const row = lost.get(name) || { name, unsuccessful: 0, chargedCancellation: 0 };
    row[key]++;
    lost.set(name, row);
  };
  dated.filter((j) => j.status === 'Unsuccessful').forEach((j) => bump(j, 'unsuccessful'));
  completedInRange.filter((j) => CANCELLATION.test(categoryName(ref, j.categoryId))).forEach((j) => bump(j, 'chargedCancellation'));

  return {
    quotes: { count: quotes.length, bands: bandsFor('Quote') },
    booked: { count: booked.length, bands: bandsFor('booked') },
    conversion: { created: dated.length, won, lost: lostCount, waiting: dated.length - decided, rate: decided ? won / decided : null },
    lost: Array.from(lost.values()).sort((a, b) => b.unsuccessful + b.chargedCancellation - (a.unsuccessful + a.chargedCancellation)),
    open: rows.sort((a, b) => (b.ageDays ?? -1) - (a.ageDays ?? -1)),
  };
}

// ─── Clients ────────────────────────────────────────────────────────────────

export interface ClientRow {
  id: string;
  name: string;
  jobs: number;
  value: number;
  share: number;
  previousValue: number;
  previousJobs: number;
  /** Jobs completed with no value in ServiceM8 */
  unpricedJobs: number;
  change: number | null;
  /** Worked with before but nothing in this range */
  lapsed: boolean;
}

export function clients(completed: Job[], previous: Job[], ref: Reference): ClientRow[] {
  const total = sum(completed, (j) => j.value);
  const rows = new Map<string, ClientRow>();
  const row = (id: string) => {
    let r = rows.get(id);
    if (!r) {
      r = { id, name: clientName(ref, id), jobs: 0, value: 0, share: 0, previousValue: 0, previousJobs: 0, unpricedJobs: 0, change: null, lapsed: false };
      rows.set(id, r);
    }
    return r;
  };
  for (const j of completed) {
    const r = row(j.clientId);
    r.jobs++;
    r.value += j.value;
    if (j.value <= 0) r.unpricedJobs++;
  }
  for (const j of previous) {
    const r = row(j.clientId);
    r.previousJobs++;
    r.previousValue += j.value;
  }
  return Array.from(rows.values())
    .map((r) => ({
      ...r,
      value: round(r.value),
      previousValue: round(r.previousValue),
      share: total ? r.value / total : 0,
      change: change(r.value, r.previousValue),
      lapsed: r.jobs === 0 && r.previousJobs > 0,
    }))
    .sort((a, b) => b.value - a.value || b.jobs - a.jobs || b.previousValue - a.previousValue);
}

export interface JobRow {
  id: string;
  number: string;
  completedAt: string | null;
  category: string;
  clientId: string;
  client: string;
  value: number;
  paid: boolean;
  postcode: string;
}

export function jobRows(jobs: Job[], ref: Reference): JobRow[] {
  return jobs
    .map((j) => ({
      id: j.id,
      number: j.number,
      completedAt: day(j.completedAt),
      category: categoryName(ref, j.categoryId),
      clientId: j.clientId,
      client: clientName(ref, j.clientId),
      value: j.value,
      paid: j.paid,
      postcode: j.postcode,
    }))
    .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
}

// ─── Money owed ─────────────────────────────────────────────────────────────

export interface OwedJob extends JobRow {
  ageDays: number;
  band: AgeBand;
}

export interface MoneyOwed {
  total: number;
  jobs: number;
  bands: { key: AgeBand; label: string; value: number; jobs: number }[];
  clients: { id: string; name: string; jobs: number; value: number; oldestDays: number }[];
  list: OwedJob[];
}

export function moneyOwed(unpaid: Job[], ref: Reference, today: string): MoneyOwed {
  const owed = unpaid.filter((j) => j.value > 0 && j.completedAt);
  const list = jobRows(owed, ref).map((r) => {
    const ageDays = Math.max(0, daysBetween(r.completedAt!, today));
    return { ...r, ageDays, band: ageBand(ageDays) };
  });
  const byClient = new Map<string, MoneyOwed['clients'][number]>();
  owed.forEach((j) => {
    const r = byClient.get(j.clientId) || { id: j.clientId, name: clientName(ref, j.clientId), jobs: 0, value: 0, oldestDays: 0 };
    r.jobs++;
    r.value += j.value;
    r.oldestDays = Math.max(r.oldestDays, Math.max(0, daysBetween(day(j.completedAt)!, today)));
    byClient.set(j.clientId, r);
  });
  return {
    total: round(sum(owed, (j) => j.value)),
    jobs: owed.length,
    bands: AGE_BANDS.map((b) => {
      const inBand = list.filter((r) => r.band === b.key);
      return { key: b.key, label: b.label, jobs: inBand.length, value: round(sum(inBand, (r) => r.value)) };
    }),
    clients: Array.from(byClient.values())
      .map((c) => ({ ...c, value: round(c.value) }))
      .sort((a, b) => b.value - a.value),
    list: list.sort((a, b) => b.ageDays - a.ageDays),
  };
}

// ─── Queues ─────────────────────────────────────────────────────────────────

export interface QueueJob {
  id: string;
  number: string;
  queue: string;
  status: string;
  date: string | null;
  expiry: string | null;
  /** The queue's "come back to it" date has passed */
  expired: boolean;
  category: string;
  client: string;
  assigned: string | null;
  postcode: string;
}

export function queues(queued: Job[], ref: Reference, today: string) {
  const jobs: QueueJob[] = queued
    .map((j) => ({
      id: j.id,
      number: j.number,
      queue: (j.queueId && ref.queues.get(j.queueId)) || 'Unknown queue',
      status: j.status,
      date: day(j.date),
      expiry: day(j.queueExpiry),
      expired: !!j.queueExpiry && day(j.queueExpiry)! < today,
      category: categoryName(ref, j.categoryId),
      client: clientName(ref, j.clientId),
      assigned: j.queueStaffId ? ref.staff.get(j.queueStaffId) || null : null,
      postcode: j.postcode,
    }))
    .sort((a, b) => a.queue.localeCompare(b.queue) || (a.date || '').localeCompare(b.date || ''));
  const summary = Array.from(
    jobs.reduce((m, j) => {
      const r = m.get(j.queue) || { name: j.queue, jobs: 0, expired: 0, oldest: null as string | null };
      r.jobs++;
      if (j.expired) r.expired++;
      if (j.date && (!r.oldest || j.date < r.oldest)) r.oldest = j.date;
      return m.set(j.queue, r);
    }, new Map<string, { name: string; jobs: number; expired: number; oldest: string | null }>())
  )
    .map(([, r]) => r)
    .sort((a, b) => b.jobs - a.jobs);
  return { summary, jobs };
}

// ─── Pricing ────────────────────────────────────────────────────────────────

export interface PriceRow {
  id: string;
  name: string;
  listPrice: number | null;
  lines: number;
  quantity: number;
  averageCharged: number;
  belowList: number;
  aboveList: number;
  /** Money given away below the list price (before VAT) */
  discount: number;
}

export interface BelowListLine {
  jobId: string;
  number: string;
  client: string;
  item: string;
  quantity: number;
  listPrice: number;
  charged: number;
  discount: number;
}

export function pricing(completed: Job[], lines: JobMaterial[], ref: Reference) {
  const jobs = new Map(completed.map((j) => [j.id, j]));
  const onJobs = lines.filter((l) => jobs.has(l.jobId) && l.quantity > 0);
  const rows = new Map<string, PriceRow & { chargedTotal: number }>();
  const below: BelowListLine[] = [];

  for (const l of onJobs) {
    const listed = l.materialId ? ref.materials.get(l.materialId) : undefined;
    const id = listed ? l.materialId : `custom:${l.name.toLowerCase()}`;
    const r =
      rows.get(id) ||
      ({ id, name: listed?.name || l.name || 'Unnamed line', listPrice: listed && listed.price > 0 ? listed.price : null, lines: 0, quantity: 0, averageCharged: 0, belowList: 0, aboveList: 0, discount: 0, chargedTotal: 0 } as PriceRow & { chargedTotal: number });
    r.lines++;
    r.quantity += l.quantity;
    r.chargedTotal += l.price * l.quantity;
    if (listed && listed.price > 0) {
      if (l.price < listed.price - 0.005) {
        r.belowList++;
        const discount = (listed.price - l.price) * l.quantity;
        r.discount += discount;
        const job = jobs.get(l.jobId)!;
        below.push({ jobId: job.id, number: job.number, client: clientName(ref, job.clientId), item: r.name, quantity: l.quantity, listPrice: listed.price, charged: l.price, discount: round(discount) });
      } else if (l.price > listed.price + 0.005) r.aboveList++;
    }
    rows.set(id, r);
  }

  const jobsWithLines = new Set(onJobs.map((l) => l.jobId));
  return {
    rows: Array.from(rows.values())
      .map(({ chargedTotal, ...r }) => ({ ...r, quantity: round(r.quantity), discount: round(r.discount), averageCharged: r.quantity ? round(chargedTotal / r.quantity) : 0 }))
      .sort((a, b) => b.lines - a.lines),
    below: below.sort((a, b) => b.discount - a.discount),
    totalDiscount: round(sum(below, (b) => b.discount)),
    coverage: { jobs: completed.length, withLines: completed.filter((j) => jobsWithLines.has(j.id)).length },
  };
}

// ─── CSV ────────────────────────────────────────────────────────────────────

export function toCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const cell = (v: string | number | null | undefined) => {
    const s = v === null || v === undefined ? '' : String(v);
    // Quote, and stop spreadsheet formulas running from text fields
    const safe = /^[=+\-@]/.test(s) && Number.isNaN(Number(s)) ? `'${s}` : s;
    return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return [headers, ...rows].map((r) => r.map(cell).join(',')).join('\n');
}

// ─── Staff ──────────────────────────────────────────────────────────────────

export interface StaffRow {
  staffId: string;
  staffName: string;
  completedJobs: number;
  hours: number;
  /** Average hours on site per job checked in and out of */
  hoursPerJob: number | null;
  travelHours: number;
  /** Share of on-the-clock time spent travelling */
  travelShare: number | null;
  value: number;
  valuePerHour: number | null;
}

export interface JobTypeTime {
  name: string;
  visits: number;
  averageHours: number;
  /** Fastest and slowest quarter boundaries, to show the usual spread */
  low: number;
  high: number;
}

function quantile(sorted: number[], q: number) {
  if (!sorted.length) return 0;
  const i = (sorted.length - 1) * q;
  const lo = Math.floor(i);
  return sorted[lo] + (sorted[Math.ceil(i)] - sorted[lo]) * (i - lo);
}

/** Productivity per person and time on site per job type, from timesheet lines */
export function staffReport(data: TimesheetData, ref: Reference, staffFilter?: Set<string>) {
  const lines = data.lines.filter((l) => !staffFilter?.size || staffFilter.has(l.staffId));
  const summary = data.summary.filter((s) => !staffFilter?.size || staffFilter.has(s.staffId));

  const timed = lines.filter((l) => l.source === 'Checked in' && l.hours !== null && l.hours > 0 && l.hours <= 12);
  const rows: StaffRow[] = summary
    .map((s) => {
      const mine = timed.filter((l) => l.staffId === s.staffId);
      const jobs = new Set(mine.map((l) => l.jobId)).size;
      const travelHours = s.travelMinutes / 60;
      return {
        staffId: s.staffId,
        staffName: s.staffName,
        completedJobs: s.completedJobs,
        hours: s.hours,
        hoursPerJob: jobs ? round(sum(mine, (l) => l.hours!) / jobs) : null,
        travelHours: round(travelHours, 1),
        travelShare: s.hours + travelHours > 0 ? travelHours / (s.hours + travelHours) : null,
        value: s.valueCredited,
        valuePerHour: s.hours > 0 ? round(s.valueCredited / s.hours) : null,
      };
    })
    .filter((r) => r.completedJobs > 0 || r.hours > 0)
    .sort((a, b) => b.value - a.value || a.staffName.localeCompare(b.staffName));

  const byType = new Map<string, number[]>();
  for (const l of timed) {
    const name = categoryName(ref, l.categoryId);
    byType.set(name, [...(byType.get(name) || []), l.hours!]);
  }
  const jobTypes: JobTypeTime[] = Array.from(byType, ([name, hours]) => {
    const sorted = hours.sort((a, b) => a - b);
    return { name, visits: sorted.length, averageHours: round(sum(sorted, (h) => h) / sorted.length), low: round(quantile(sorted, 0.25)), high: round(quantile(sorted, 0.75)) };
  }).sort((a, b) => b.visits - a.visits);

  return { rows, jobTypes, timedVisits: timed.length };
}
