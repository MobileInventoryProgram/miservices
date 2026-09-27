import { getOne, list, sm8Date } from './client';

/**
 * Staff timesheets from ServiceM8, pulled live for a date range.
 *
 * A timesheet line is a check-in/check-out on a job (a "recorded" job
 * activity). Completed jobs nobody checked in to get a "Booked only" line for
 * whoever was booked on them, so every completed job is credited to the
 * person who did it rather than whoever pressed Complete (often the office).
 */

interface Sm8Staff {
  uuid: string;
  first: string;
  last: string;
}

interface Sm8Activity {
  uuid: string;
  active: number;
  job_uuid: string;
  staff_uuid: string;
  start_date: string;
  end_date: string;
  activity_was_scheduled: number;
  activity_was_recorded: number;
  travel_time_in_seconds: string;
  travel_distance_in_meters: string;
}

interface Sm8Job {
  uuid: string;
  active: number;
  generated_job_id: string;
  date: string;
  status: string;
  completion_date: string;
  completion_actioned_by_uuid: string;
  total_invoice_amount: string;
  geo_postcode: string;
}

type Job = {
  number: string;
  status: string;
  completedAt: string | null;
  completedById: string | null;
  value: number;
  postcode: string;
};

export type TimesheetSource = 'Checked in' | 'Booked only';

export interface TimesheetLine {
  key: string;
  jobId: string;
  /** Check-in time, or the booked time for "Booked only" lines */
  date: string;
  jobNumber: string;
  staffId: string;
  staffName: string;
  checkIn: string | null;
  checkOut: string | null;
  hours: number | null;
  travelMinutes: number;
  travelMiles: number;
  status: string;
  completedAt: string | null;
  completedBy: string | null;
  /** Job was completed by someone other than this person */
  completedByOther: boolean;
  jobValue: number;
  /** This person's share of the job value (on their first line for the job only, so the column sums) */
  valueCredited: number;
  source: TimesheetSource;
  note: string;
  postcode: string;
}

export interface StaffSummary {
  staffId: string;
  staffName: string;
  /** Different jobs they checked in to */
  jobsWorked: number;
  /** Completed jobs credited to them (checked in, or booked if nobody checked in) */
  completedJobs: number;
  /** Credited completed jobs they never checked in to */
  bookedOnly: number;
  /** Share of credited completed jobs they checked in to (null when none) */
  checkInRate: number | null;
  hours: number;
  travelMinutes: number;
  travelMiles: number;
  /** Jobs they pressed Complete on (whoever did the work) */
  completionsPressed: number;
  /** Their credited jobs that someone else pressed Complete on */
  completedByOther: number;
  valueCredited: number;
}

export interface TimesheetData {
  from: string;
  to: string;
  lines: TimesheetLine[];
  summary: StaffSummary[];
  staff: { id: string; name: string }[];
  fetchedAt: string;
}

// ─── Dates ──────────────────────────────────────────────────────────────────

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const MAX_RANGE_DAYS = 366;

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isDate(value: string): boolean {
  return DATE_RE.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

/** ServiceM8 sends '0000-00-00 00:00:00' for empty dates */
function validStamp(value: string | undefined): string | null {
  return value && !value.startsWith('0000') ? value : null;
}

/** Hours between two ServiceM8 stamps (both account local time) */
function hoursBetween(start: string, end: string | null): number | null {
  if (!end) return null;
  const ms = Date.parse(`${end.replace(' ', 'T')}Z`) - Date.parse(`${start.replace(' ', 'T')}Z`);
  return Number.isFinite(ms) && ms >= 0 ? ms / 3_600_000 : null;
}

const round = (n: number, dp = 2) => Math.round(n * 10 ** dp) / 10 ** dp;

// ─── Fetching ───────────────────────────────────────────────────────────────

/** Jobs are dated when booked, so look this far before the range for jobs worked in it */
const JOB_LOOKBACK_DAYS = 90;
const SINGLE_FETCH_CONCURRENCY = 4;

function slimJob(job: Sm8Job): Job {
  return {
    number: job.generated_job_id,
    status: job.status,
    completedAt: validStamp(job.completion_date),
    completedById: job.completion_actioned_by_uuid || null,
    value: Number(job.total_invoice_amount) || 0,
    postcode: job.geo_postcode || '',
  };
}

/**
 * The jobs behind these activities. ServiceM8 can't look up a list of jobs in
 * one request, so fetch jobs dated around the range in one go, then the few
 * older ones one by one. Deleted jobs are left out.
 */
async function fetchJobs(jobIds: Set<string>, from: string, to: string): Promise<Map<string, Job>> {
  const jobs = new Map<string, Job>();
  const windowed = await list<Sm8Job>(
    'job',
    `date gt ${sm8Date(addDays(from, -JOB_LOOKBACK_DAYS))} and date lt ${sm8Date(addDays(to, 1))}`
  );
  for (const job of windowed) {
    if (jobIds.has(job.uuid) && job.active === 1) jobs.set(job.uuid, slimJob(job));
  }

  const seen = new Set(windowed.map((j) => j.uuid));
  const remaining = Array.from(jobIds).filter((id) => !seen.has(id));
  for (let i = 0; i < remaining.length; i += SINGLE_FETCH_CONCURRENCY) {
    const batch = remaining.slice(i, i + SINGLE_FETCH_CONCURRENCY);
    const found = await Promise.all(batch.map((id) => getOne<Sm8Job>('job', id).catch(() => null)));
    for (const job of found) {
      if (job && job.active === 1) jobs.set(job.uuid, slimJob(job));
    }
  }
  return jobs;
}

async function buildTimesheets(from: string, to: string): Promise<TimesheetData> {
  const [staffRecords, activities] = await Promise.all([
    list<Sm8Staff>('staff'),
    list<Sm8Activity>(
      'jobactivity',
      `start_date gt ${sm8Date(addDays(from, -1), '23:59:59')} and start_date lt ${sm8Date(addDays(to, 1))}`
    ),
  ]);

  const staffNames = new Map(staffRecords.map((s) => [s.uuid, `${s.first || ''} ${s.last || ''}`.trim() || 'Unnamed']));
  const nameOf = (id: string | null) => (id ? staffNames.get(id) || 'Unknown staff' : null);

  const live = activities.filter((a) => a.active === 1 && a.job_uuid && a.staff_uuid);
  const jobs = await fetchJobs(new Set(live.map((a) => a.job_uuid)), from, to);
  const current = live.filter((a) => jobs.has(a.job_uuid));

  const recorded = current.filter((a) => a.activity_was_recorded === 1);
  const checkedInJobs = new Set(recorded.map((a) => a.job_uuid));

  // Completed jobs nobody checked in to: credit whoever was booked (once per person per job)
  const bookedOnly = new Map<string, Sm8Activity>();
  for (const a of current) {
    if (a.activity_was_scheduled !== 1 || checkedInJobs.has(a.job_uuid)) continue;
    if (jobs.get(a.job_uuid)!.status !== 'Completed') continue;
    const key = `${a.job_uuid}|${a.staff_uuid}`;
    if (!bookedOnly.has(key)) bookedOnly.set(key, a);
  }

  // Who each job is credited to
  const credited = new Map<string, Set<string>>();
  for (const a of [...recorded, ...Array.from(bookedOnly.values())]) {
    if (!credited.has(a.job_uuid)) credited.set(a.job_uuid, new Set());
    credited.get(a.job_uuid)!.add(a.staff_uuid);
  }

  const lineFor = (a: Sm8Activity, source: TimesheetSource): TimesheetLine => {
    const job = jobs.get(a.job_uuid)!;
    const checkOut = source === 'Checked in' ? validStamp(a.end_date) : null;
    const hours = source === 'Checked in' ? hoursBetween(a.start_date, checkOut) : null;
    let note = '';
    if (source === 'Checked in' && hours === null) note = 'No check-out';
    else if (hours !== null && hours > 12) note = 'Over 12 hours – check';
    return {
      key: a.uuid,
      jobId: a.job_uuid,
      date: a.start_date,
      jobNumber: job.number,
      staffId: a.staff_uuid,
      staffName: nameOf(a.staff_uuid)!,
      checkIn: source === 'Checked in' ? a.start_date : null,
      checkOut,
      hours: hours === null ? null : round(hours),
      travelMinutes: source === 'Checked in' ? Math.round((Number(a.travel_time_in_seconds) || 0) / 60) : 0,
      travelMiles: source === 'Checked in' ? round((Number(a.travel_distance_in_meters) || 0) / 1609.344, 1) : 0,
      status: job.status,
      completedAt: job.completedAt,
      completedBy: nameOf(job.completedById),
      completedByOther: job.status === 'Completed' && !!job.completedById && job.completedById !== a.staff_uuid,
      jobValue: job.value,
      valueCredited: 0,
      source,
      note,
      postcode: job.postcode,
    };
  };

  const lines = [
    ...recorded.map((a) => lineFor(a, 'Checked in')),
    ...Array.from(bookedOnly.values()).map((a) => lineFor(a, 'Booked only')),
  ].sort((a, b) => b.date.localeCompare(a.date) || a.staffName.localeCompare(b.staffName));

  // Completed jobs' value split equally between the people credited, on each person's first line
  const shared = new Set<string>();
  for (const line of Array.from(lines).reverse()) {
    const key = `${line.jobId}|${line.staffId}`;
    if (line.status !== 'Completed' || shared.has(key)) continue;
    shared.add(key);
    line.valueCredited = round(line.jobValue / credited.get(line.jobId)!.size);
  }

  return {
    from,
    to,
    lines,
    summary: summarise(lines, jobs, from, to, nameOf),
    staff: Array.from(staffNames, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)),
    fetchedAt: new Date().toISOString(),
  };
}

function summarise(
  lines: TimesheetLine[],
  jobs: Map<string, Job>,
  from: string,
  to: string,
  nameOf: (id: string | null) => string | null
): StaffSummary[] {
  const rows = new Map<string, StaffSummary & { worked: Set<string>; completed: Set<string>; checkedIn: Set<string>; other: Set<string> }>();
  const row = (id: string) => {
    if (!rows.has(id)) {
      rows.set(id, {
        staffId: id,
        staffName: nameOf(id)!,
        jobsWorked: 0,
        completedJobs: 0,
        bookedOnly: 0,
        checkInRate: null,
        hours: 0,
        travelMinutes: 0,
        travelMiles: 0,
        completionsPressed: 0,
        completedByOther: 0,
        valueCredited: 0,
        worked: new Set(),
        completed: new Set(),
        checkedIn: new Set(),
        other: new Set(),
      });
    }
    return rows.get(id)!;
  };

  for (const line of lines) {
    const r = row(line.staffId);
    if (line.source === 'Checked in') {
      r.worked.add(line.jobNumber);
      r.hours += line.hours ?? 0;
      r.travelMinutes += line.travelMinutes;
      r.travelMiles += line.travelMiles;
    }
    if (line.status === 'Completed') {
      r.completed.add(line.jobNumber);
      if (line.source === 'Checked in') r.checkedIn.add(line.jobNumber);
      if (line.completedByOther) r.other.add(line.jobNumber);
    }
    r.valueCredited += line.valueCredited;
  }

  // Who pressed Complete, for jobs completed in the range
  const end = addDays(to, 1);
  for (const job of Array.from(jobs.values())) {
    if (job.status !== 'Completed' || !job.completedById || !job.completedAt) continue;
    if (job.completedAt < from || job.completedAt >= end) continue;
    row(job.completedById).completionsPressed += 1;
  }

  return Array.from(rows.values())
    .map(({ worked, completed, checkedIn, other, ...r }) => ({
      ...r,
      jobsWorked: worked.size,
      completedJobs: completed.size,
      bookedOnly: completed.size - checkedIn.size,
      checkInRate: completed.size ? checkedIn.size / completed.size : null,
      completedByOther: other.size,
      hours: round(r.hours),
      travelMiles: round(r.travelMiles, 1),
      valueCredited: round(r.valueCredited),
    }))
    .sort((a, b) => a.staffName.localeCompare(b.staffName));
}

// ─── Cache ──────────────────────────────────────────────────────────────────

/**
 * Pulls are held for a few minutes so switching views, paging and downloading
 * don't hit ServiceM8 again. Nothing is stored beyond this in-memory copy.
 */
const CACHE_MS = 5 * 60 * 1000;
const MAX_CACHED_RANGES = 6;
type CacheEntry = { at: number; data: Promise<TimesheetData> };
// On globalThis so the page, the CSV download and Refresh share one cache (Next bundles them separately)
const store = globalThis as typeof globalThis & { __timesheetCache?: Map<string, CacheEntry> };
const cache = (store.__timesheetCache ??= new Map<string, CacheEntry>());

export function getTimesheets(from: string, to: string): Promise<TimesheetData> {
  const key = `${from}|${to}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.data;

  const data = buildTimesheets(from, to);
  cache.set(key, { at: Date.now(), data });
  data.catch(() => cache.delete(key));
  while (cache.size > MAX_CACHED_RANGES) cache.delete(cache.keys().next().value!);
  return data;
}

/** Forget cached pulls so the next view comes straight from ServiceM8 */
export function clearTimesheetCache() {
  cache.clear();
}

// ─── Filtering and CSV ──────────────────────────────────────────────────────

export function filterLines(lines: TimesheetLine[], { staff, q }: { staff?: string; q?: string }) {
  const job = q?.trim().replace(/^#/, '');
  return lines.filter((l) => (!staff || l.staffId === staff) && (!job || l.jobNumber.includes(job)));
}

export function filterSummary(summary: StaffSummary[], { staff }: { staff?: string }) {
  return staff ? summary.filter((s) => s.staffId === staff) : summary;
}

function csvCell(value: string | number | null | undefined): string {
  const text = value == null ? '' : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(header: string[], rows: (string | number | null)[][]): string {
  // BOM so Excel opens it as UTF-8
  return '﻿' + [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

const stamp = (value: string | null) => (value ? value.slice(0, 16) : '');

export function linesCsv(lines: TimesheetLine[]): string {
  return toCsv(
    ['Job number', 'Date', 'Staff', 'Check in', 'Check out', 'Hours on site', 'Travel (mins)', 'Travel (miles)', 'Source', 'Job status', 'Completed', 'Completed by', 'Completed by someone else', 'Job value', 'Value credited', 'Postcode', 'Note'],
    lines.map((l) => [
      l.jobNumber,
      l.date.slice(0, 10),
      l.staffName,
      stamp(l.checkIn),
      stamp(l.checkOut),
      l.hours,
      l.travelMinutes,
      l.travelMiles,
      l.source,
      l.status,
      stamp(l.completedAt),
      l.completedBy,
      l.completedByOther ? 'Yes' : 'No',
      l.jobValue.toFixed(2),
      l.valueCredited.toFixed(2),
      l.postcode,
      l.note,
    ])
  );
}

export function summaryCsv(summary: StaffSummary[]): string {
  return toCsv(
    ['Staff', 'Jobs checked in', 'Completed jobs credited', 'Completed with no check-in', 'Check-in rate', 'Hours on site', 'Travel (mins)', 'Travel (miles)', 'Completions pressed', 'Completed by someone else', 'Value credited'],
    summary.map((s) => [
      s.staffName,
      s.jobsWorked,
      s.completedJobs,
      s.bookedOnly,
      s.checkInRate === null ? '' : `${Math.round(s.checkInRate * 100)}%`,
      s.hours,
      s.travelMinutes,
      s.travelMiles,
      s.completionsPressed,
      s.completedByOther,
      s.valueCredited.toFixed(2),
    ])
  );
}
