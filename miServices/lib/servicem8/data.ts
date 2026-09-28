import 'server-only';
import { cached, inBatches, oldest, type Pulled } from './cache';
import { list, sm8Date } from './client';
import { addDays } from './timesheets';

/**
 * Read-only pulls from ServiceM8 for Head Office's reports. Records are
 * slimmed to the fields the reports use as soon as they arrive (a year of raw
 * jobs is ~70 MB), then held briefly in memory. Nothing is stored.
 */

const MINUTE = 60_000;
/** The current month (and anything open) changes all day */
const LIVE_TTL = 5 * MINUTE;
/** Finished months and lists that rarely change */
const SETTLED_TTL = 30 * MINUTE;
/** Months pulled at once */
const CONCURRENCY = 3;

// ─── Shapes ─────────────────────────────────────────────────────────────────

interface Sm8Job {
  uuid: string;
  active: number;
  generated_job_id: string;
  status: string;
  date: string;
  quote_date: string;
  work_order_date: string;
  completion_date: string;
  total_invoice_amount: string;
  payment_received: boolean | number | string;
  payment_date: string;
  company_uuid: string;
  category_uuid: string;
  queue_uuid: string;
  queue_expiry_date: string;
  queue_assigned_staff_uuid: string;
  geo_postcode: string;
}

export interface Job {
  id: string;
  number: string;
  status: string;
  /** Booked/created date (ServiceM8's job date) */
  date: string | null;
  quoteDate: string | null;
  completedAt: string | null;
  /** As ServiceM8 holds it: including VAT */
  value: number;
  paid: boolean;
  paidAt: string | null;
  clientId: string;
  categoryId: string;
  queueId: string;
  queueExpiry: string | null;
  queueStaffId: string;
  postcode: string;
}

export interface JobMaterial {
  jobId: string;
  materialId: string;
  name: string;
  quantity: number;
  /** Unit price charged, before VAT */
  price: number;
}

export interface Reference {
  staff: Map<string, string>;
  /** Current staff, A–Z, for the staff picker */
  activeStaff: { id: string; name: string }[];
  categories: Map<string, string>;
  queues: Map<string, string>;
  clients: Map<string, string>;
  /** ServiceM8's own price list: item → name and unit price before VAT */
  materials: Map<string, { name: string; price: number }>;
}

/** ServiceM8 sends '0000-00-00 00:00:00' for empty dates */
export function stamp(value: string | undefined | null): string | null {
  return value && !value.startsWith('0000') ? value : null;
}

const yes = (v: boolean | number | string | undefined) => v === true || v === 1 || v === '1';

function slimJob(j: Sm8Job): Job {
  return {
    id: j.uuid,
    number: j.generated_job_id || '',
    status: j.status,
    date: stamp(j.date),
    quoteDate: stamp(j.quote_date),
    completedAt: stamp(j.completion_date),
    value: Number(j.total_invoice_amount) || 0,
    paid: yes(j.payment_received),
    paidAt: stamp(j.payment_date),
    clientId: j.company_uuid || '',
    categoryId: j.category_uuid || '',
    queueId: j.queue_uuid || '',
    queueExpiry: stamp(j.queue_expiry_date),
    queueStaffId: j.queue_assigned_staff_uuid || '',
    postcode: (j.geo_postcode || '').trim().toUpperCase(),
  };
}

async function jobs(filter: string): Promise<Job[]> {
  const rows = await list<Sm8Job>('job', `active eq 1 and ${filter}`);
  return rows.filter((j) => j.active === 1).map(slimJob);
}

// ─── Month chunks ───────────────────────────────────────────────────────────

/** First day of each month the range touches */
function monthsIn(from: string, to: string): string[] {
  const months: string[] = [];
  let [y, m] = from.split('-').map(Number);
  const [ty, tm] = to.split('-').map(Number);
  while (y < ty || (y === ty && m <= tm)) {
    months.push(`${y}-${String(m).padStart(2, '0')}-01`);
    if (++m > 12) {
      m = 1;
      y++;
    }
  }
  return months;
}

function nextMonth(first: string): string {
  const [y, m] = first.split('-').map(Number);
  return m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`;
}

/** A month still changing: this month, or last month for the first week (late completions and payments) */
function monthIsLive(first: string, today: string): boolean {
  return nextMonth(first) > addDays(today, -7);
}

function ukToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date());
}

/**
 * Records whose `field` falls in the range, pulled a calendar month at a time
 * so each month is cached on its own and reused by any range that covers it.
 */
async function byMonth<T>(kind: string, from: string, to: string, pull: (start: string, end: string) => Promise<T[]>, dateOf: (row: T) => string | null) {
  const today = ukToday();
  const chunks = await inBatches(monthsIn(from, to), CONCURRENCY, (first) =>
    cached(`${kind}:${first}`, monthIsLive(first, today) ? LIVE_TTL : SETTLED_TTL, () => pull(first, nextMonth(first)))
  );
  const end = `${to} 23:59:59`;
  const data = chunks.flatMap((c) => c.data).filter((row) => {
    const d = dateOf(row);
    return !!d && d >= from && d <= end;
  });
  return { data, at: oldest(...chunks) } as Pulled<T[]>;
}

const between = (field: string, start: string, end: string) => `${field} gt ${sm8Date(addDays(start, -1), '23:59:59')} and ${field} lt ${sm8Date(end)}`;

/** Jobs completed in the range (the basis for value) */
export function completedJobs(from: string, to: string) {
  return byMonth('completed', from, to, (s, e) => jobs(`status eq 'Completed' and ${between('completion_date', s, e)}`), (j) => j.completedAt);
}

/** Jobs dated (booked or created) in the range, any status */
export function datedJobs(from: string, to: string) {
  return byMonth('dated', from, to, (s, e) => jobs(between('date', s, e)), (j) => j.date);
}

/** Item lines are added when a job is set up: look this far before a range for them */
export const PRICING_LOOKBACK_DAYS = 120;

/**
 * Item lines edited from `since` to today. Lines are added when a job is set
 * up, so a look-back before the range catches the lines of jobs completed in it.
 */
export function jobMaterialsSince(since: string) {
  type Row = { active: number; job_uuid: string; material_uuid: string; name: string; quantity: string; price: string; edit_date: string };
  return byMonth(
    'jobmaterial',
    since,
    ukToday(),
    async (s, e) =>
      (await list<Row>('jobmaterial', `active eq 1 and ${between('edit_date', s, e)}`))
        .filter((r) => r.active === 1)
        .map((r) => ({
          jobId: r.job_uuid,
          materialId: r.material_uuid || '',
          name: (r.name || '').trim(),
          quantity: Number(r.quantity) || 0,
          price: Number(r.price) || 0,
          editedAt: r.edit_date,
        })),
    (r) => r.editedAt
  );
}

// ─── Snapshots (not tied to a date range) ───────────────────────────────────

/** Jobs at the quote stage and booked jobs not yet done (two exact matches: ServiceM8's `ne` with `and` misbehaves) */
export function openJobs() {
  return cached('open', LIVE_TTL, async () => {
    const [quotes, booked] = await Promise.all([jobs("status eq 'Quote'"), jobs("status eq 'Work Order'")]);
    return [...quotes, ...booked];
  });
}

/** Jobs sitting in a job queue */
export function queuedJobs() {
  return cached('queued', LIVE_TTL, () => jobs("queue_uuid ne ''"));
}

/** How far back Money owed looks */
export const OWED_LOOKBACK_DAYS = 365;

/** Completed jobs in the last year not marked as paid */
export function unpaidJobs() {
  const since = addDays(ukToday(), -OWED_LOOKBACK_DAYS);
  return cached('unpaid', LIVE_TTL, () => jobs(`status eq 'Completed' and payment_received eq 0 and completion_date gt ${sm8Date(since)}`));
}

// ─── Reference lists ────────────────────────────────────────────────────────

const names = <T extends { uuid: string }>(rows: T[], name: (r: T) => string) => new Map(rows.map((r) => [r.uuid, name(r).trim() || 'Unnamed']));

/** Staff, job types, queues, clients and items, for naming things */
export async function reference(): Promise<Pulled<Reference>> {
  const [staff, categories, queues, clients, materials] = await Promise.all([
    cached('ref:staff:v2', SETTLED_TTL, async () => {
      const rows = await list<{ uuid: string; first: string; last: string; active: number }>('staff');
      const all = names(rows, (s) => `${s.first || ''} ${s.last || ''}`);
      const active = rows
        .filter((r) => r.active === 1)
        .map((r) => ({ id: r.uuid, name: all.get(r.uuid)! }))
        .sort((a, b) => a.name.localeCompare(b.name));
      return { all, active };
    }),
    cached('ref:categories', SETTLED_TTL, async () => names(await list<{ uuid: string; name: string }>('category'), (c) => c.name || '')),
    cached('ref:queues', SETTLED_TTL, async () => names(await list<{ uuid: string; name: string }>('queue'), (q) => q.name || '')),
    cached('ref:clients', SETTLED_TTL, async () => names(await list<{ uuid: string; name: string }>('company'), (c) => c.name || '')),
    cached('ref:materials', SETTLED_TTL, async () => {
      const rows = await list<{ uuid: string; name: string; price: string }>('material');
      return new Map(rows.map((m) => [m.uuid, { name: (m.name || '').trim() || 'Unnamed item', price: Number(m.price) || 0 }]));
    }),
  ]);
  return {
    data: { staff: staff.data.all, activeStaff: staff.data.active, categories: categories.data, queues: queues.data, clients: clients.data, materials: materials.data },
    at: oldest(staff, categories, queues, clients, materials),
  };
}

// ─── Who each job is credited to ────────────────────────────────────────────

type Activity = { jobId: string; staffId: string; recorded: boolean };

async function activities(filter: string): Promise<Activity[]> {
  type Row = { active: number; job_uuid: string; staff_uuid: string; activity_was_recorded: number };
  return (await list<Row>('jobactivity', `active eq 1 and ${filter}`))
    .filter((a) => a.active === 1 && a.job_uuid && a.staff_uuid)
    .map((a) => ({ jobId: a.job_uuid, staffId: a.staff_uuid, recorded: a.activity_was_recorded === 1 }));
}

/**
 * Who each job is credited to, the same way as Timesheets: whoever checked in
 * to it, or whoever was booked on it if nobody checked in. From check-ins and
 * bookings starting on or after `since`, plus future bookings when asked.
 */
async function jobCredits(since: string, includeFuture: boolean): Promise<Pulled<Map<string, Set<string>>>> {
  const today = ukToday();
  const months = monthsIn(since, today);
  const afterThisMonth = nextMonth(months[months.length - 1]);
  const [chunks, future] = await Promise.all([
    inBatches(months, CONCURRENCY, (first) =>
      cached(`activity:${first}`, monthIsLive(first, today) ? LIVE_TTL : SETTLED_TTL, () => activities(between('start_date', first, nextMonth(first))))
    ),
    includeFuture ? cached(`activity:from:${afterThisMonth}`, LIVE_TTL, () => activities(`start_date gt ${sm8Date(afterThisMonth)}`)) : Promise.resolve(null),
  ]);

  const recorded = new Map<string, Set<string>>();
  const booked = new Map<string, Set<string>>();
  for (const a of [...chunks.flatMap((c) => c.data), ...(future?.data || [])]) {
    const into = a.recorded ? recorded : booked;
    if (!into.has(a.jobId)) into.set(a.jobId, new Set());
    into.get(a.jobId)!.add(a.staffId);
  }
  const credits = new Map(booked);
  recorded.forEach((staff, jobId) => credits.set(jobId, staff));
  return { data: credits, at: oldest(...chunks, ...(future ? [future] : [])) };
}

/** Selected staff from the `staff` query value (comma separated ids) */
export function staffSet(value: string | null | undefined): Set<string> {
  return new Set((value || '').split(',').map((s) => s.trim()).filter(Boolean));
}

/**
 * Keep only jobs credited to the chosen staff (or assigned to them in a
 * queue). With nobody chosen, every job is kept and nothing extra is pulled.
 * `since` is how far back to look for check-ins and bookings.
 */
export async function staffFilter(staff: Set<string>, since: string, includeFuture = false) {
  if (!staff.size) return { active: false, keep: (_: Job) => true, at: Date.now() };
  const credits = await jobCredits(since, includeFuture);
  return {
    active: true,
    keep: (j: Job) => staff.has(j.queueStaffId) || Array.from(credits.data.get(j.id) || []).some((s) => staff.has(s)),
    at: credits.at,
  };
}

/** Check-ins for jobs completed in a range can start this long before it */
export const CREDIT_LOOKBACK_DAYS = 90;
